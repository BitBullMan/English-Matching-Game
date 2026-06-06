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

const dataModule = await import(pathToFileURL(path.join(ROOT, 'src/data/words.js')).href)
// 默认只处理 WORDS+PHRASES（有 emoji 的 218 个）；
// 设 INCLUDE_VOCAB=1 时也处理 2932 个 vocab-3000 扩展词
// 设 LIMIT=500 时只处理前 500 个（防 git 仓库过大）
const baseWords = process.env.INCLUDE_VOCAB === '1'
  ? dataModule.ALL_VOCAB
  : dataModule.WORDS
const LIMIT = parseInt(process.env.LIMIT || '0', 10)
const WORDS = LIMIT > 0 ? baseWords.slice(0, LIMIT) : baseWords
console.log(`处理 ${WORDS.length} 个词条 (INCLUDE_VOCAB=${process.env.INCLUDE_VOCAB || '0'} LIMIT=${LIMIT})`)

const OUT_DIR = path.join(ROOT, 'public/audio')
await fs.mkdir(OUT_DIR, { recursive: true })

const MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts'
const VOICES = {
  uk: process.env.OPENAI_VOICE_UK || 'fable',     // 英音男声，明亮清晰
  us: process.env.OPENAI_VOICE_US || 'nova',
  zh: process.env.OPENAI_VOICE_ZH || 'nova'
}
const INSTR = {
  uk: "Speak with a clear, bright, energetic British English accent — like a confident young English teacher. Articulate every consonant crisply. Avoid sounding low or muffled.",
  us: "Speak with a clear, warm American English accent. Pronounce the word naturally and clearly, like a friendly English teacher introducing a new vocabulary word to a learner.",
  zh: "请用清晰标准的普通话朗读这个中文词或短语，像一位友好的汉语老师在教外国人学中文。语速自然，吐字清楚。"
}

const ACCENTS = (process.env.ACCENTS || 'uk,us,zh').split(',')

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

// 并发跑 — OpenAI TTS 允许 ~50 req/min，开 8 并发安全
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '8', 10)

const jobs = []
for (const w of WORDS) {
  for (const accent of ACCENTS) {
    // zh 用中文文本，uk/us 用英文文本
    const text = accent === 'zh' ? w.chinese : w.english
    const out = path.join(OUT_DIR, `${w.id}-${accent}.mp3`)
    jobs.push({ word: w, accent, text, out })
  }
}

// 先过滤掉已存在的
const remaining = []
let skipped = 0
for (const j of jobs) {
  try { await fs.access(j.out); skipped++ } catch (_) { remaining.push(j) }
}
console.log(`待生成 ${remaining.length} 个 (已存在 ${skipped})\n`)

let done = 0, failed = 0
async function worker(jobs) {
  while (jobs.length) {
    const j = jobs.shift()
    if (!j) return
    try {
      await gen(j.text, j.accent, j.out)
      done++
      process.stdout.write(`✓ ${j.word.english}(${j.accent}) `)
    } catch (e) {
      failed++
      process.stdout.write(`✗ ${j.word.english}(${j.accent}) `)
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(remaining)))
console.log('')
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 新生成: ${done}   ⏭️  已存在: ${skipped}   ❌ 失败: ${failed}`)
console.log(`📁 mp3 在 ${path.relative(ROOT, OUT_DIR)}/`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('\n下一步：')
console.log('  git add public/audio')
console.log('  git commit -m "feat: add OpenAI TTS pregenerated audio"')
console.log('  git push')
console.log('  → Cloudflare/Vercel 自动部署，所有用户听到同款高质量发音')
