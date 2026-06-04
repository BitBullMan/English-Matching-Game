/**
 * Pexels API 批量下载真实场景图，输出 WebP 600×400 到 public/images/<id>.webp
 *
 * 用法：
 *   PEXELS_API_KEY=xxx node scripts/fetch-pexels.mjs --target words
 *   PEXELS_API_KEY=xxx node scripts/fetch-pexels.mjs --target phrases --limit 100
 *
 * 输出：
 *   public/images/<word.id>.webp   ← 600×400 WebP, ~30-60KB 每张
 *   data/image-map-<target>.json   ← { wordId: '/images/xxx.webp' } 映射，可手动 merge 进 words.js
 *
 * 免费配额：200 req/h, 20000 req/月 (够用)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// env
const envFile = path.join(ROOT, '.env.local')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}
const API_KEY = process.env.PEXELS_API_KEY
if (!API_KEY) {
  console.error('❌ 缺少 PEXELS_API_KEY')
  process.exit(1)
}

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => {
  if (a.startsWith('--')) return [a.slice(2), arr[i + 1]]
  return null
}).filter(Boolean))
const TARGET = args.target || 'words'
const LIMIT = parseInt(args.limit || '99999')
const CONCURRENCY = parseInt(args.concurrency || '6')   // Pexels 限速保守

const IMG_DIR = path.join(ROOT, 'public/images')
const MAP_FILE = path.join(ROOT, `data/image-map-${TARGET}.json`)
fs.mkdirSync(IMG_DIR, { recursive: true })
fs.mkdirSync(path.dirname(MAP_FILE), { recursive: true })

// 已完成
const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {}
console.log(`📦 已完成 ${Object.keys(map).length}`)

// 加载词库
async function loadWords() {
  const url = pathToFileURL(path.join(ROOT, 'src/data/words.js')).href
  const mod = await import(url)
  if (TARGET === 'words') return mod.WORDS.filter(w => w.type !== 'phrase')
  if (TARGET === 'phrases') return mod.WORDS.filter(w => w.type === 'phrase')
  if (TARGET === 'vocab') return mod.VOCAB_3000.slice(0, LIMIT)
  return []
}

// 搜索词 → Pexels 关键词优化（去掉标点 + 取核心名词）
function searchQuery(word) {
  // 对短语：用英文（去掉标点）
  let q = (word.english || '').replace(/[!?.,'"]/g, '').trim()
  // 太长的（>3 个词）：只取前 2 个
  const tokens = q.split(/\s+/)
  if (tokens.length > 3) q = tokens.slice(0, 2).join(' ')
  return q
}

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`
  const r = await fetch(url, { headers: { Authorization: API_KEY } })
  if (!r.ok) throw new Error(`Pexels ${r.status}: ${await r.text()}`)
  const json = await r.json()
  return json.photos || []
}

async function downloadAndCompress(photoUrl, outPath) {
  // 下载到临时文件
  const tmpFile = outPath + '.tmp'
  const r = await fetch(photoUrl)
  if (!r.ok) throw new Error(`download ${r.status}`)
  const buf = Buffer.from(await r.arrayBuffer())
  fs.writeFileSync(tmpFile, buf)
  // 用 ImageMagick 压缩 + WebP
  const cmd = spawnSync('convert', [
    tmpFile,
    '-resize', '600x400^',
    '-gravity', 'center',
    '-extent', '600x400',
    '-quality', '78',
    outPath,
  ])
  fs.unlinkSync(tmpFile)
  if (cmd.status !== 0) throw new Error(`convert failed: ${cmd.stderr}`)
}

async function worker(word) {
  if (map[word.id]) return
  const query = searchQuery(word)
  try {
    const photos = await searchPexels(query)
    if (!photos.length) {
      console.log(`  ✗ ${word.id} "${query}" — no results`)
      return
    }
    // 取第一张（Pexels 搜索默认按 relevance）
    const photo = photos[0]
    const downloadUrl = photo.src.large   // ~1000px
    const outPath = path.join(IMG_DIR, `${word.id}.webp`)
    await downloadAndCompress(downloadUrl, outPath)
    map[word.id] = `/images/${word.id}.webp`
    // 增量写入 map
    fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2))
    console.log(`  ✓ ${word.id} ← "${query}" (by ${photo.photographer})`)
  } catch (e) {
    console.error(`  ✗ ${word.id} "${query}": ${e.message}`)
  }
}

const all = await loadWords()
const todo = all.filter(w => !map[w.id]).slice(0, LIMIT)
console.log(`🎯 ${TARGET}: 待处理 ${todo.length}/${all.length}, 并发 ${CONCURRENCY}`)

const queue = [...todo]
await Promise.all(Array(CONCURRENCY).fill(0).map(async () => {
  while (queue.length) {
    await worker(queue.shift())
  }
}))

console.log(`\n✅ 完成。共 ${Object.keys(map).length} 张图`)
console.log(`📂 图片: ${IMG_DIR}`)
console.log(`📋 映射: ${MAP_FILE}`)
