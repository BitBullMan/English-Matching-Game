/**
 * 把 data/image-map-words.json 应用到 src/data/words.js
 * 给每个 W({ id, ... }) 加 image:'/images/xxx.webp' 字段
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MAP = path.join(ROOT, 'data/image-map-words.json')
const TARGET = path.join(ROOT, 'src/data/words.js')

const map = JSON.parse(fs.readFileSync(MAP, 'utf8'))
let src = fs.readFileSync(TARGET, 'utf8')

let applied = 0, skipped = 0
for (const [id, url] of Object.entries(map)) {
  const idEsc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 匹配整个 W({ id:'xxx', ... }) 块
  const re = new RegExp(`(W\\(\\{\\s*id:\\s*['"]${idEsc}['"][\\s\\S]+?)(\\s*\\}\\),)`)
  const m = re.exec(src)
  if (!m) { skipped++; continue }
  const block = m[1]
  const tail = m[2]
  let newBlock = block
  if (/image:\s*['"]/.test(newBlock)) {
    newBlock = newBlock.replace(/image:\s*['"][^'"]*['"]/, `image:'${url}'`)
  } else {
    // 加在 emoji 字段后面
    newBlock = newBlock.replace(/(emoji:\s*['"][^'"]+['"])/, `$1, image:'${url}'`)
  }
  src = src.slice(0, m.index) + newBlock + tail + src.slice(m.index + m[0].length)
  applied++
}

fs.writeFileSync(TARGET, src)
console.log(`✅ 应用 ${applied} 张图，跳过 ${skipped}`)
