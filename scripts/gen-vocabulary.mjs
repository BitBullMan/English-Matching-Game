#!/usr/bin/env node
/**
 * 批量生成词库 — OpenAI GPT-4o-mini 把英文词表扩成完整词条
 * 支持断点续跑：每个词进 JSONL 增量写入，再次运行会跳过已存在的
 *
 * 用法：
 *   export OPENAI_API_KEY=sk-xxxx
 *   node scripts/gen-vocabulary.mjs <input.txt> <output.jsonl>
 *
 *   示例：
 *   node scripts/gen-vocabulary.mjs data/vocab-filtered.txt data/vocab-generated.jsonl
 *
 * 跑完后用 scripts/jsonl-to-js.mjs 转成可 import 的 JS 文件
 */
import fs from 'node:fs'
import { promises as fsp } from 'node:fs'

const KEY = process.env.OPENAI_API_KEY
if (!KEY) { console.error('❌ Missing OPENAI_API_KEY'); process.exit(1) }

const [, , inputFile, outputFile] = process.argv
if (!inputFile || !outputFile) {
  console.error('Usage: node scripts/gen-vocabulary.mjs <input.txt> <output.jsonl>')
  process.exit(1)
}

const MODEL = process.env.MODEL || 'gpt-4o-mini'
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '15', 10)
const BATCH = parseInt(process.env.BATCH || '8', 10)

const PROMPT = `You are a vocabulary builder for an English-Chinese learning app for daily life / travel.
For each English word, output a JSON object with these exact fields:
{
  "english": "Word (capitalized)",
  "chinese": "中文翻译",
  "pinyin": "pīn yīn (with tone marks)",
  "ipa_uk": "/ˈwɜːd/",
  "ipa_us": "/ˈwɝːd/",
  "category": "food | home | clothing | animal | transport | nature | body | emotion | action | abstract | other",
  "example_en": "A short (≤10 words) DAILY-LIFE sentence using this word. NO idioms/slang.",
  "example_zh": "中文翻译",
  "memo_en": "One short, memorable fact (etymology/mnemonic). ≤15 words.",
  "memo_zh": "中文版的记忆点"
}

Words: %WORDS%

Output ONLY a JSON object {"items":[{...},{...}]}. NO markdown. NO explanation.`

async function genBatch(words) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: PROMPT.replace('%WORDS%', words.join(', ')) }],
      response_format: { type: 'json_object' }
    })
  })
  if (!r.ok) throw new Error(`${r.status}: ${(await r.text()).slice(0,80)}`)
  const data = await r.json()
  const parsed = JSON.parse(data.choices[0].message.content)
  return parsed.items || parsed.words || parsed.array || []
}

// 读输入 + 已生成
const allWords = fs.readFileSync(inputFile, 'utf-8').split('\n').map(s => s.trim()).filter(Boolean)
let done = new Set()
if (fs.existsSync(outputFile)) {
  fs.readFileSync(outputFile, 'utf-8').split('\n').filter(Boolean).forEach(line => {
    try {
      const o = JSON.parse(line)
      if (o.english) done.add(o.english.toLowerCase())
    } catch (_) {}
  })
}
const remaining = allWords.filter(w => !done.has(w.toLowerCase()))
console.log(`Loaded ${allWords.length}, done ${done.size}, remaining ${remaining.length}\n`)
if (!remaining.length) { console.log('✅ All done'); process.exit(0) }

// 分批
const batches = []
for (let i = 0; i < remaining.length; i += BATCH) batches.push(remaining.slice(i, i + BATCH))

const outStream = fs.createWriteStream(outputFile, { flags: 'a' })
let doneCount = 0, failedCount = 0

async function worker(q) {
  while (q.length) {
    const batch = q.shift(); if (!batch) return
    try {
      const arr = await genBatch(batch)
      for (const item of arr) outStream.write(JSON.stringify(item) + '\n')
      doneCount += arr.length
      process.stdout.write(`✓${doneCount} `)
    } catch (e) {
      failedCount += batch.length
      process.stdout.write(`✗ `)
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(batches)))
outStream.end()
console.log(`\n\n✅ +${doneCount} new (total ${done.size + doneCount}/${allWords.length})  ❌ ${failedCount}`)
