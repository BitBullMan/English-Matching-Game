/**
 * 把 data/image-map-vocab.json 应用到 src/data/vocab-3000.js
 * 给每个 v_xxx 加 image:"/images/v_xxx.webp"
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MAP = path.join(ROOT, 'data/image-map-vocab.json')
const TARGET = path.join(ROOT, 'src/data/vocab-3000.js')

const map = JSON.parse(fs.readFileSync(MAP, 'utf8'))
console.log(`📦 ${Object.keys(map).length} 张图待 apply`)

let src = fs.readFileSync(TARGET, 'utf8')
let applied = 0, missed = 0

function esc(s) {
  if (typeof s !== 'string') return ''
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

for (const [id, url] of Object.entries(map)) {
  const idEsc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`("id":\\s*"${idEsc}",)`)
  const m = re.exec(src)
  if (!m) { missed++; continue }
  if (src.slice(m.index, m.index + 200).includes('"image":')) {
    applied++; continue
  }
  const insertion = `${m[1]}"image":"${esc(url)}",`
  src = src.slice(0, m.index) + insertion + src.slice(m.index + m[0].length)
  applied++
}

fs.writeFileSync(TARGET, src)
console.log(`✅ apply ${applied}, 未匹配 ${missed}`)
