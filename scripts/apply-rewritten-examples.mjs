/**
 * 把 data/rewritten-examples-words.jsonl 应用到 src/data/words.js
 * 通过正则找到每个 W({ id:'xxx', ... }) 行，替换 example_en/zh/pinyin/memo_en/zh
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '..')
const JSONL = path.join(ROOT, 'data/rewritten-examples-words.jsonl')
const TARGET = path.join(ROOT, 'src/data/words.js')

const updates = {}
for (const line of fs.readFileSync(JSONL, 'utf8').split('\n')) {
  if (!line.trim()) continue
  try {
    const r = JSON.parse(line)
    updates[r.id] = r
  } catch (_) {}
}
console.log(`📦 加载 ${Object.keys(updates).length} 条重写`)

let src = fs.readFileSync(TARGET, 'utf8')
let applied = 0, skipped = 0

// 用于在 example_en:'...' 中安全 escape
function esc(s) { return (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'") }

// 严格匹配 JS 字符串字面量（开头引号 = 结尾引号），允许内部转义
// 用法：fieldRe('memo_en') → /memo_en:\s*(?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/
function fieldRe(name) {
  return new RegExp(`${name}:\\s*(?:'(?:\\\\.|[^'\\\\])*'|"(?:\\\\.|[^"\\\\])*")`)
}

for (const [id, r] of Object.entries(updates)) {
  // 用 [\s\S]+? 跨行（非贪婪）匹配整个 W({ id:'apple', ... }), 直到 ' }),
  // 注意要 escape id 中的特殊字符
  const idEsc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 找到该 word 的整个 W({...}) 块（到匹配的 }), 为止）
  const re = new RegExp(`(W\\(\\{\\s*id:\\s*['"]${idEsc}['"][\\s\\S]+?)(\\s*\\}\\),)`, 'g')
  const m = re.exec(src)
  if (!m) {
    skipped++
    console.warn(`  ✗ 找不到 ${id}`)
    continue
  }
  const block = m[1]   // 不含尾部 ' }),'
  const tail = m[2]

  // 在 block 内替换或添加 example/memo 字段
  let newBlock = block

  function replaceOrAdd(name, value, addPrefix = ', ') {
    const re = fieldRe(name)
    if (re.test(newBlock)) {
      newBlock = newBlock.replace(re, `${name}:'${esc(value)}'`)
    } else {
      newBlock += `${addPrefix}${name}:'${esc(value)}'`
    }
  }

  replaceOrAdd('example_en', r.example_en, ',\n      ')
  replaceOrAdd('example_zh', r.example_zh)
  replaceOrAdd('example_pinyin', r.example_pinyin)

  if (r.memo_en) {
    replaceOrAdd('memo_en', r.memo_en, ',\n      ')
    if (r.memo_zh) replaceOrAdd('memo_zh', r.memo_zh)
  } else {
    // 没新 memo 则删除原字段
    const memoEnRe = new RegExp(`,?\\s*${fieldRe('memo_en').source}`)
    const memoZhRe = new RegExp(`,?\\s*${fieldRe('memo_zh').source}`)
    newBlock = newBlock.replace(memoEnRe, '').replace(memoZhRe, '')
  }

  src = src.slice(0, m.index) + newBlock + tail + src.slice(m.index + m[0].length)
  applied++
  re.lastIndex = m.index + newBlock.length + tail.length
}

fs.writeFileSync(TARGET, src)
console.log(`✅ 应用 ${applied} 条，跳过 ${skipped} 条`)
console.log(`📄 写回 ${TARGET}`)
