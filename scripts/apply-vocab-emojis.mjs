/**
 * 把 data/vocab-emojis.jsonl 的 emoji 写入 src/data/vocab-3000.js
 * 给每个 v_xxx 词加 emoji 字段
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const JSONL = path.join(ROOT, 'data/vocab-emojis.jsonl')
const TARGET = path.join(ROOT, 'src/data/vocab-3000.js')

const emojiMap = {}
for (const line of fs.readFileSync(JSONL, 'utf8').split('\n')) {
  if (!line.trim()) continue
  try {
    const r = JSON.parse(line)
    if (r.emoji) emojiMap[r.id] = r.emoji
  } catch (_) {}
}
console.log(`📦 加载 ${Object.keys(emojiMap).length} 个 emoji`)

let src = fs.readFileSync(TARGET, 'utf8')
let applied = 0, missed = 0

function esc(s) {
  if (typeof s !== 'string') return ''
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

for (const [id, emoji] of Object.entries(emojiMap)) {
  const idEsc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 匹配 `{"id":"v_xxx",` 或 `{ id: 'v_xxx',` 后插入 emoji
  // VOCAB_3000 数据格式：let me check first
  const re = new RegExp(`("id":\\s*"${idEsc}",)`)
  const m = re.exec(src)
  if (!m) { missed++; continue }
  // 跳过已有 emoji
  if (src.slice(m.index, m.index + 200).includes('"emoji":')) {
    applied++; continue
  }
  const insertion = `${m[1]}"emoji":"${esc(emoji)}",`
  src = src.slice(0, m.index) + insertion + src.slice(m.index + m[0].length)
  applied++
}

fs.writeFileSync(TARGET, src)
console.log(`✅ 应用 ${applied}, 未匹配 ${missed}`)
