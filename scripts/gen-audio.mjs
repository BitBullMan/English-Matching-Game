#!/usr/bin/env node
/**
 * 预生成全词库的 OpenAI TTS mp3
 * 用法：
 *   OPENAI_API_KEY=sk-xxxx node scripts/gen-audio.mjs
 *
 * 默认模型 gpt-4o-mini-tts、默认 voice：英音 ash、美音 sage（最接近 Arbor 的随和风格）
 * 可覆盖：
 *   OPENAI_TTS_MODEL=tts-1-hd OPENAI_VOICE_UK=ash OPENAI_VOICE_US=sage \
 *     node scripts/gen-audio.mjs
 *
 * 输出：public/audio/<id>-<uk|us>.mp3
 * 成本：32 词 × 2 ≈ 64 次请求；gpt-4o-mini-tts ~$0.015/min，单词 1 秒级，总 < $0.10
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const KEY = process.env.OPENAI_API_KEY
if (!KEY) {
  console.error('Missing OPENAI_API_KEY environment variable.')
  process.exit(1)
}

const { WORDS } = await import(pathToFileURL(path.join(ROOT, 'src/data/words.js')).href)

const OUT_DIR = path.join(ROOT, 'public/audio')
await fs.mkdir(OUT_DIR, { recursive: true })

const MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts'
const VOICES = {
  uk: process.env.OPENAI_VOICE_UK || 'ash',
  us: process.env.OPENAI_VOICE_US || 'sage'
}
const INSTR = {
  uk: "Speak in a warm, easygoing British accent. Pronounce the word clearly and naturally, like you're teaching a child a new vocabulary word.",
  us: "Speak in a warm, easygoing American accent. Pronounce the word clearly and naturally, like you're teaching a child a new vocabulary word."
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
    throw new Error(`OpenAI TTS ${r.status}: ${await r.text()}`)
  }
  const buf = Buffer.from(await r.arrayBuffer())
  await fs.writeFile(outPath, buf)
}

console.log(`Model: ${MODEL}  ·  UK voice: ${VOICES.uk}  ·  US voice: ${VOICES.us}`)
console.log(`Output: ${path.relative(ROOT, OUT_DIR)}\n`)

let done = 0
for (const w of WORDS) {
  for (const accent of ['uk', 'us']) {
    const out = path.join(OUT_DIR, `${w.id}-${accent}.mp3`)
    try { await fs.access(out); continue } catch (_) {}
    process.stdout.write(`  ${w.english.padEnd(14)} ${accent}  →  `)
    try {
      await gen(w.english, accent, out)
      console.log('ok')
      done++
      await new Promise(r => setTimeout(r, 150))
    } catch (e) {
      console.log('FAIL:', e.message)
    }
  }
}
console.log(`\nGenerated ${done} new audio files into ${path.relative(ROOT, OUT_DIR)}`)
