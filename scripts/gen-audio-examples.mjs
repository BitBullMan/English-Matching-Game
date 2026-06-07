#!/usr/bin/env node
/**
 * 为所有词的 example / memo 预生成 mp3
 *
 * 文件名约定（speech.js 会按 `${wordId}-${accent}.mp3` 找）：
 *   <wordId>_ex_en-us.mp3    ← example_en，美音
 *   <wordId>_ex_zh-zh.mp3    ← example_zh，中音
 *   <wordId>_memo_en-us.mp3
 *   <wordId>_memo_zh-zh.mp3
 *
 * （只生成有内容的字段，跳过 null/空）
 * 用法：
 *   node scripts/gen-audio-examples.mjs              # WORDS only
 *   INCLUDE_VOCAB=1 node scripts/gen-audio-examples.mjs   # 全 3000+
 */
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// env
const envFile = path.join(ROOT, '.env.local')
if (fsSync.existsSync(envFile)) {
  for (const line of fsSync.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}
const KEY = process.env.OPENAI_API_KEY
if (!KEY) { console.error('❌ 缺少 OPENAI_API_KEY'); process.exit(1) }

const dataModule = await import(pathToFileURL(path.join(ROOT, 'src/data/words.js')).href)
const WORDS = process.env.INCLUDE_VOCAB === '1' ? dataModule.ALL_VOCAB : dataModule.WORDS
const LIMIT = parseInt(process.env.LIMIT || '0', 10)
const TODO = LIMIT > 0 ? WORDS.slice(0, LIMIT) : WORDS

const OUT_DIR = path.join(ROOT, 'public/audio')
await fs.mkdir(OUT_DIR, { recursive: true })

const MODEL = 'gpt-4o-mini-tts'
const VOICES = { uk: 'alloy', us: 'nova', zh: 'nova' }   // uk 改 alloy 跟 gen-audio.mjs 一致
const INSTR = {
  uk: "Speak with a warm, friendly, clear voice — like a patient teacher reading an example sentence. Soft but bright tone, every word distinct and easy to follow.",
  us: "Speak in a clear, warm American English accent. Read this sentence naturally, like a friendly teacher demonstrating real conversation.",
  zh: "请用清晰、温柔的标准普通话朗读这个句子，像一位友好的汉语老师在示范日常对话。语速自然，吐字清楚。"
}

// EN_ACCENT: 控制 example_en / memo_en 用哪个 accent (us 或 uk 或 both)
// 默认 us（向后兼容），传 uk 则生成 alloy 英音版
const EN_ACCENT = process.env.EN_ACCENT || 'us'

async function gen(text, accent, outPath) {
  const body = { model: MODEL, voice: VOICES[accent], input: text, response_format: 'mp3' }
  body.instructions = INSTR[accent]
  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`)
  const buf = Buffer.from(await r.arrayBuffer())
  await fs.writeFile(outPath, buf)
}

// 构建任务清单
const jobs = []
for (const w of TODO) {
  if (w.example_en) jobs.push({ id: `${w.id}_ex_en`, accent: EN_ACCENT, text: w.example_en, wid: w.id })
  if (w.example_zh) jobs.push({ id: `${w.id}_ex_zh`, accent: 'zh', text: w.example_zh, wid: w.id })
  if (w.memo_en)    jobs.push({ id: `${w.id}_memo_en`, accent: EN_ACCENT, text: w.memo_en, wid: w.id })
  if (w.memo_zh)    jobs.push({ id: `${w.id}_memo_zh`, accent: 'zh', text: w.memo_zh, wid: w.id })
}

// 过滤已存在
const remaining = []
let skipped = 0
for (const j of jobs) {
  const out = path.join(OUT_DIR, `${j.id}-${j.accent}.mp3`)
  try { await fs.access(out); skipped++ } catch (_) { remaining.push({ ...j, out }) }
}
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`词数 ${TODO.length} → mp3 任务 ${jobs.length}（待生成 ${remaining.length}，已存在 ${skipped}）`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10', 10)
let done = 0, failed = 0
const startedAt = Date.now()

async function worker(q) {
  while (q.length) {
    const j = q.shift()
    if (!j) return
    try {
      await gen(j.text, j.accent, j.out)
      done++
      if (done % 20 === 0) {
        const speed = done / ((Date.now() - startedAt) / 1000)
        console.log(`  ✓ ${done}/${remaining.length}  (${speed.toFixed(1)}/s)  最新: ${j.id}`)
      }
    } catch (e) {
      failed++
      console.error(`  ✗ ${j.id}: ${e.message.slice(0, 80)}`)
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(remaining)))

console.log(`\n✅ 完成 ${done}, 失败 ${failed}, 跳过 ${skipped}`)
console.log(`📁 ${OUT_DIR}/`)
