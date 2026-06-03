#!/usr/bin/env node
/**
 * 批量生成词库 — 用 OpenAI GPT-4o-mini 把英文词表扩到 3000 词
 *
 * 用法：
 *   export OPENAI_API_KEY=sk-xxxx
 *   node scripts/gen-vocabulary.mjs [词表文件] [输出文件]
 *
 *   示例：
 *   node scripts/gen-vocabulary.mjs data/oxford3000.txt src/data/vocab-generated.js
 *
 * 输入文件：每行一个英文单词（lower case），如 oxford3000.txt:
 *   apple
 *   banana
 *   carry
 *   ...
 *
 * 输出：完整 JS 词条文件，可直接 import 到 words.js
 *   每个词包含：english, chinese, pinyin, ipa_uk, ipa_us, category,
 *               example_en, example_zh, example_pinyin, memo_en, memo_zh
 *
 * 成本估算（gpt-4o-mini 输入 $0.15/M、输出 $0.60/M）：
 *   3000 词 × ~500 token = 1.5M token ≈ $0.90
 *
 * 速度：并发 10，约 5-10 分钟跑完 3000 词
 *
 * 推荐英文词表来源（公共域 / 可商用）：
 *   - NGSL: https://www.newgeneralservicelist.com/  (2800 词)
 *   - Oxford 3000: https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000
 *   - GSL (General Service List): 2000 词
 *   - 1000 most common English words (Wikipedia)
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const KEY = process.env.OPENAI_API_KEY
if (!KEY) {
  console.error('❌ 缺少 OPENAI_API_KEY')
  process.exit(1)
}

const [, , inputFile, outputFile] = process.argv
if (!inputFile || !outputFile) {
  console.error('Usage: node scripts/gen-vocabulary.mjs <input.txt> <output.js>')
  process.exit(1)
}

const MODEL = process.env.MODEL || 'gpt-4o-mini'
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10', 10)
const BATCH = parseInt(process.env.BATCH || '5', 10)  // 每次让 GPT 处理 5 个词

const PROMPT_TEMPLATE = `You are a vocabulary builder for an English-Chinese learning app.
For each English word given, output a JSON object with these exact fields:
{
  "english": "word (capitalized)",
  "chinese": "中文翻译",
  "pinyin": "pīn yīn (with tone marks)",
  "ipa_uk": "/ˈwɜːd/",
  "ipa_us": "/ˈwɝːd/",
  "category": "food | home | clothing | animal | transport | nature | body | emotion | action | other",
  "example_en": "A short DAILY-LIFE sentence using this word (NOT idiom/slang).",
  "example_zh": "中文翻译该例句",
  "memo_en": "One short, memorable fact about the word (etymology / cultural / mnemonic). One sentence.",
  "memo_zh": "中文版的记忆点"
}

Words: %WORDS%

Output ONLY a JSON array of objects, no markdown, no explanation. Example:
[{"english":"Apple",...},{"english":"Book",...}]`

async function genBatch(words) {
  const prompt = PROMPT_TEMPLATE.replace('%WORDS%', words.join(', '))
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })
  })
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`)
  const json = await r.json()
  const content = json.choices[0].message.content
  // GPT 可能返回 {array:[...]} 或直接数组的对象包装；尽量兼容
  const parsed = JSON.parse(content)
  const arr = Array.isArray(parsed) ? parsed
            : Array.isArray(parsed.items) ? parsed.items
            : Array.isArray(parsed.words) ? parsed.words
            : Array.isArray(parsed.array) ? parsed.array
            : Array.isArray(parsed.data) ? parsed.data
            : [parsed]
  return arr
}

// 读输入
const raw = await fs.readFile(inputFile, 'utf-8')
const words = raw.split('\n').map(s => s.trim().toLowerCase()).filter(Boolean)
console.log(`Loaded ${words.length} words from ${inputFile}`)

// 分批
const batches = []
for (let i = 0; i < words.length; i += BATCH) {
  batches.push(words.slice(i, i + BATCH))
}
console.log(`${batches.length} batches of ${BATCH} (concurrency ${CONCURRENCY})\n`)

const results = []
let done = 0, failed = 0

async function worker(queue) {
  while (queue.length) {
    const batch = queue.shift()
    if (!batch) return
    try {
      const arr = await genBatch(batch)
      results.push(...arr)
      done += arr.length
      process.stdout.write(`✓ ${done}/${words.length}  `)
    } catch (e) {
      failed += batch.length
      process.stdout.write(`✗ ${batch.join(',')} (${e.message.slice(0,40)})  `)
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(batches)))

// 输出 JS 文件
let out = `// 自动生成 (gen-vocabulary.mjs) — ${new Date().toISOString()}\n`
out += `// 词条 ${results.length} 个\n\n`
out += `const W = (o) => ({ type: 'word', ...o })\n\n`
out += `export const GENERATED_WORDS = [\n`
for (const w of results) {
  // 简单 id：取英文小写+无空格
  const id = (w.english || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 20)
  if (!id) continue
  out += `  W({ id:'${id}', english:${JSON.stringify(w.english)}, chinese:${JSON.stringify(w.chinese)}, pinyin:${JSON.stringify(w.pinyin)}, ipa_uk:${JSON.stringify(w.ipa_uk)}, ipa_us:${JSON.stringify(w.ipa_us)}, category:${JSON.stringify(w.category)}, example_en:${JSON.stringify(w.example_en)}, example_zh:${JSON.stringify(w.example_zh)}, memo_en:${JSON.stringify(w.memo_en)}, memo_zh:${JSON.stringify(w.memo_zh)} }),\n`
}
out += `]\n`
await fs.writeFile(outputFile, out)
console.log(`\n\n✅ 生成 ${results.length} 词到 ${outputFile}`)
console.log(`❌ 失败 ${failed} 词`)
console.log(`\n下一步：`)
console.log(`  1. 把 ${outputFile} import 到 src/data/words.js`)
console.log(`  2. 跑 node scripts/gen-audio.mjs 给新词生成 mp3`)
