/**
 * 用 OpenAI 给 VOCAB_3000 每个词智能配一个 emoji
 *
 * 规则（in prompt）：
 *   - 必须是单个 emoji（不是组合）
 *   - 选择最直觉/最相关的 emoji
 *   - 对真抽象词允许重复，但优先找细分
 *   - 输出格式 JSON：{ "id": "v_business", "emoji": "💼" }
 *
 * 用法：
 *   LIMIT=500 node scripts/gen-vocab-emojis.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const envFile = path.join(ROOT, '.env.local')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}
const API_KEY = process.env.OPENAI_API_KEY
if (!API_KEY) { console.error('❌ 缺少 OPENAI_API_KEY'); process.exit(1) }

const LIMIT = parseInt(process.env.LIMIT || '500')
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '15')

const mod = await import(pathToFileURL(path.join(ROOT, 'src/data/words.js')).href)
const all = mod.VOCAB_3000.slice(0, LIMIT)

const OUT_FILE = path.join(ROOT, 'data/vocab-emojis.jsonl')
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })

const done = new Set()
if (fs.existsSync(OUT_FILE)) {
  for (const line of fs.readFileSync(OUT_FILE, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try { done.add(JSON.parse(line).id) } catch (_) {}
  }
}
console.log(`📦 已完成 ${done.size}`)

const todo = all.filter(w => !done.has(w.id))
console.log(`🎯 ${todo.length} 待配 emoji (并发 ${CONCURRENCY})`)

async function getEmoji(word) {
  const prompt = `Pick ONE emoji that best represents the English word "${word.english}" (Chinese meaning: "${word.chinese}").

Rules:
- Output ONLY the emoji character, nothing else
- If concrete (noun like "garden", "phone"): pick the matching object emoji
- If abstract: pick the most intuitive metaphor (e.g. "already" → ⏰, "provides" → 🎁, "trade" → 🤝)
- Place names: use flag or globe (e.g. "Africa" → 🌍, "London" → 🇬🇧, "Japan" → 🇯🇵)
- Prefer common Unicode 6.0+ emojis with wide font support
- Avoid multi-codepoint sequences if possible

Return only JSON: {"emoji": "..."}`

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  })
  if (!r.ok) throw new Error(`OpenAI ${r.status}`)
  const j = await r.json()
  const obj = JSON.parse(j.choices[0].message.content)
  return obj.emoji
}

const startedAt = Date.now()
let ok = 0, fail = 0

async function worker(queue) {
  while (queue.length) {
    const w = queue.shift()
    try {
      const emoji = await getEmoji(w)
      fs.appendFileSync(OUT_FILE, JSON.stringify({ id: w.id, english: w.english, emoji }) + '\n')
      ok++
      if (ok % 25 === 0) {
        const speed = ok / ((Date.now() - startedAt) / 1000)
        console.log(`  ✓ ${ok}/${todo.length}  (${speed.toFixed(1)}/s)  最新: ${w.english} → ${emoji}`)
      }
    } catch (e) {
      fail++
      console.error(`  ✗ ${w.id}: ${e.message.slice(0, 60)}`)
    }
  }
}

const queue = [...todo]
await Promise.all(Array(CONCURRENCY).fill(0).map(() => worker(queue)))

console.log(`\n✅ 完成 ${ok}, 失败 ${fail}  → ${OUT_FILE}`)
