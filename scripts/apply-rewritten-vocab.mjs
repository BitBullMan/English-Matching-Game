/**
 * 把 rewritten-examples-vocab.jsonl 应用到 src/data/vocab-3000.js
 *
 * vocab-3000.js 格式：每行一个 JSON-like object，内联键值
 *   {"id":"v_xxx",...,"example_en":"...","example_zh":"...","memo_en":"...","memo_zh":"..."}
 *
 * 用 regex 替换 example_en / example_zh / example_pinyin / memo_en / memo_zh
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const JSONL = path.join(ROOT, 'data/rewritten-examples-vocab.jsonl')
const TARGET = path.join(ROOT, 'src/data/vocab-3000.js')

const updates = {}
for (const line of fs.readFileSync(JSONL, 'utf8').split('\n')) {
  if (!line.trim()) continue
  try {
    const r = JSON.parse(line)
    updates[r.id] = r
  } catch (_) {}
}
console.log(`📦 ${Object.keys(updates).length} 条重写记录`)

let src = fs.readFileSync(TARGET, 'utf8')
let applied = 0, missed = 0

function escJSON(s) {
  if (typeof s !== 'string') return ''
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

for (const [id, r] of Object.entries(updates)) {
  const idEsc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 找该 id 整行（JSON object）
  const re = new RegExp(`(\\{"id":"${idEsc}"[^\\n]*?\\})`)
  const m = re.exec(src)
  if (!m) { missed++; continue }
  let obj = m[1]

  // 替换 example_en / example_zh / example_pinyin / memo_en / memo_zh
  // 用正则替换 "field":"...."
  function setField(name, value) {
    // 严格匹配 JSON 字符串：支持转义双引号 \"
    const fieldPattern = new RegExp(`"${name}":"(?:[^"\\\\]|\\\\.)*"`)
    if (typeof value !== 'string' || !value) {
      obj = obj.replace(new RegExp(`,?"${name}":"(?:[^"\\\\]|\\\\.)*"`), '')
      return
    }
    const replacement = `"${name}":"${escJSON(value)}"`
    if (fieldPattern.test(obj)) {
      obj = obj.replace(fieldPattern, replacement)
    } else {
      obj = obj.replace(/\}$/, `,${replacement}}`)
    }
  }

  setField('example_en', r.example_en)
  setField('example_zh', r.example_zh)
  setField('example_pinyin', r.example_pinyin)
  if (r.memo_en) {
    setField('memo_en', r.memo_en)
    setField('memo_zh', r.memo_zh)
  }

  src = src.slice(0, m.index) + obj + src.slice(m.index + m[1].length)
  applied++
}

fs.writeFileSync(TARGET, src)
console.log(`✅ apply ${applied}, 未匹配 ${missed}`)
