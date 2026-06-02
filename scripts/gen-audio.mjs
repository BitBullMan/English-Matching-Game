#!/usr/bin/env node
/**
 * 一键预生成全词库的 OpenAI TTS mp3 — 商业化部署专用
 *
 * 用法：
 *   export OPENAI_API_KEY=sk-xxxx
 *   node scripts/gen-audio.mjs
 *
 * 输出：public/audio/<id>-<uk|us>.mp3 (跟代码一起 commit 到 GitHub，
 *      Cloudflare/Vercel 自动 CDN 分发)
 *
 * 成本：当前 118 词 × 2 = 236 文件 ≈ $0.10 一次性 (gpt-4o-mini-tts)
 *
 * 已存在的 mp3 会跳过 — 词库扩展后再跑一次只生成新增的
 *
 * 默认 voice：
 *   英音 coral (温暖女声) + British accent instruction → 类英音清晰女声
 *   美音 nova  (年轻清晰女声) + American accent instruction
 *
 * 可覆盖：
 *   OPENAI_TTS_MODEL=tts-1-hd OPENAI_VOICE_UK=fable node scripts/gen-audio.mjs
 *
 * OpenAI 可用 voice：alloy / ash / ballad / coral / echo / fable / nova / onyx / sage / shimmer
 *   女声推荐：coral, nova, shimmer
 *   男声选项：alloy, ash, echo, fable (英国男), onyx, sage
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const KEY = process.env.OPENAI_API_KEY
if (!KEY) {
  console.error('❌ 缺少 OPENAI_API_KEY 环境变量。')
  console.error('   先跑：export OPENAI_API_KEY=sk-xxxx')
  console.error('   去 https://platform.openai.com/api-keys 创建 key')
  process.exit(1)
}

const { WORDS } = await import(pathToFileURL(path.join(ROOT, 'src/data/words.js')).href)

const OUT_DIR = path.join(ROOT, 'public/audio')
await fs.mkdir(OUT_DIR, { recursive: true })

const MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts'
const VOICES = {
  uk: process.env.OPENAI_VOICE_UK || 'coral',     // 温暖女声 + British accent
  us: process.env.OPENAI_VOICE_US || 'nova'        // 清晰年轻女声
}
const INSTR = {
  uk: "Speak with a clear, warm British English accent. Pronounce the word naturally and clearly, like a friendly English teacher introducing a new vocabulary word to a learner.",
  us: "Speak with a clear, warm American English accent. Pronounce the word naturally and clearly, like a friendly English teacher introducing a new vocabulary word to a learner."
}

async function gen(text, accent, outPath) {
  const body = {
    model: MODEL,
    voice: VOICES[accent],
    input: text,
    response_format: 'mp3'
  }
  if (MODEL === 'gpt-4o-mini-tts') body.instructions = INSTR[accent]
  if (MODEL.startsWith('tts-1')) body.speed = accent === 'uk' ? 0.95 : 1.0

  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEY}`
    },
    body: JSON.stringify(body)
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`OpenAI TTS ${r.status}: ${txt}`)
  }
  const buf = Buffer.from(await r.arrayBuffer())
  await fs.writeFile(outPath, buf)
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`📢 模型:  ${MODEL}`)
console.log(`🇬🇧 英音:  ${VOICES.uk}`)
console.log(`🇺🇸 美音:  ${VOICES.us}`)
console.log(`📁 输出:  ${path.relative(ROOT, OUT_DIR)}/`)
console.log(`📚 词库:  ${WORDS.length} 词 × 2 = ${WORDS.length * 2} 个文件`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

let done = 0, skipped = 0, failed = 0
for (const w of WORDS) {
  for (const accent of ['uk', 'us']) {
    const out = path.join(OUT_DIR, `${w.id}-${accent}.mp3`)
    try { await fs.access(out); skipped++; continue } catch (_) {}
    process.stdout.write(`  ${w.english.padEnd(20)} ${accent}  →  `)
    try {
      await gen(w.english, accent, out)
      console.log('✓')
      done++
      await new Promise(r => setTimeout(r, 100))
    } catch (e) {
      console.log('✗ ' + e.message.slice(0, 60))
      failed++
    }
  }
}
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 新生成: ${done}   ⏭️  已存在: ${skipped}   ❌ 失败: ${failed}`)
console.log(`📁 mp3 在 ${path.relative(ROOT, OUT_DIR)}/`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('\n下一步：')
console.log('  git add public/audio')
console.log('  git commit -m "feat: add OpenAI TTS pregenerated audio"')
console.log('  git push')
console.log('  → Cloudflare/Vercel 自动部署，所有用户听到同款高质量发音')
