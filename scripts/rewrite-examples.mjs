/**
 * 重写所有词的例句：日常生活/旅游真实场景的最简单实用句
 *
 * 规则（in prompt）：
 *   - 必须是问句/请求句/陈述需求句，不要讲述句
 *   - ≤ 8 个英文单词 / ≤ 12 个汉字
 *   - 场景：购物 / 餐厅 / 问路 / 致谢 / 求助
 *   - 不能用俚语 / 谚语 / 文化梗
 *
 * 输出：JSONL 增量写入，可断点续传
 * 用法：
 *   OPENAI_API_KEY=sk-xxx node scripts/rewrite-examples.mjs --target words
 *   OPENAI_API_KEY=sk-xxx node scripts/rewrite-examples.mjs --target vocab --limit 500
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ---- 加载环境变量 ----
const envFile = path.join(ROOT, '.env.local')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}
const API_KEY = process.env.OPENAI_API_KEY
if (!API_KEY) {
  console.error('❌ 缺少 OPENAI_API_KEY')
  process.exit(1)
}

// ---- 参数 ----
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => {
  if (a.startsWith('--')) return [a.slice(2), arr[i + 1]]
  return null
}).filter(Boolean))
const TARGET = args.target || 'words'            // words | vocab
const LIMIT = parseInt(args.limit || '99999')
const CONCURRENCY = parseInt(args.concurrency || '12')
const MODEL = args.model || 'gpt-4o-mini'

// ---- 输出文件（JSONL 增量）----
const OUT_FILE = path.join(ROOT, `data/rewritten-examples-${TARGET}.jsonl`)
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })

// 读已完成
const done = new Set()
if (fs.existsSync(OUT_FILE)) {
  for (const line of fs.readFileSync(OUT_FILE, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try { done.add(JSON.parse(line).id) } catch (_) {}
  }
}
console.log(`📦 已完成 ${done.size}`)

// ---- 加载词库 ----
async function loadWords() {
  // 动态 import words.js
  const url = pathToFileURL(path.join(ROOT, 'src/data/words.js')).href
  const mod = await import(url)
  if (TARGET === 'words') return mod.WORDS.filter(w => w.type !== 'phrase')
  if (TARGET === 'vocab') return mod.VOCAB_3000
  return []
}

// ---- pinyin (用 Python 子进程，更准) ----
import { spawnSync } from 'node:child_process'
function pinyinFor(zh) {
  if (!zh) return ''
  try {
    const r = spawnSync('python3', ['-c',
      `from pypinyin import pinyin, Style
import sys, json
s = sys.stdin.read().strip()
r = pinyin(s, style=Style.TONE)
print(' '.join([x[0] for x in r]))`
    ], { input: zh, encoding: 'utf8' })
    return (r.stdout || '').trim()
  } catch (_) { return '' }
}

// ---- OpenAI 调用 ----
async function rewrite(word) {
  const prompt = `给"${word.english}" / "${word.chinese}"写一个最常见、最基础的日常生活/旅游场景例句。

严格规则：
- 必须是"问句/请求句/表达需求"等实用句型，不要讲述句
- 英文 ≤ 8 词，中文 ≤ 12 字
- 场景：购物问价/餐厅点餐/问路/打招呼/求助/致谢/赞美
- 绝对不能用俚语、谚语、文化梗
- 句子要让"刚到中国的老外"或"刚学英语的中国人"立刻能用上
- 中文用简体，加自然标点

好例子：
  apple → "An apple, please." / "来一个苹果。"
  corn → "How much is the corn?" / "玉米多少钱？"
  hotel → "Where is the hotel?" / "酒店在哪里？"
  thank → "Thank you very much." / "非常感谢。"

坏例子（不要这样）：
  watermelon → "Watermelon is 92% water." ✗ 讲述句
  pineapple → "Pineapple on pizza, yes or no?" ✗ 文化梗
  banana → "Go bananas means crazy." ✗ 俚语

也请重写记忆点 memo：一句话日常生活联想（不要俚语），8 字内英文 + 10 字内中文。
如果 memo 找不到合适联想，写 null。

只返回 JSON，不要任何 markdown 代码块或解释：
{
  "example_en": "...",
  "example_zh": "...",
  "memo_en": "..." or null,
  "memo_zh": "..." or null
}`

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    }),
  })
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`)
  const json = await r.json()
  const content = JSON.parse(json.choices[0].message.content)
  return content
}

// ---- 主循环 ----
const all = await loadWords()
const todo = all.filter(w => !done.has(w.id)).slice(0, LIMIT)
console.log(`🎯 目标 ${TARGET}：共 ${all.length}，待处理 ${todo.length}，并发 ${CONCURRENCY}`)

const startedAt = Date.now()
let okCount = 0, errCount = 0

async function worker(word) {
  try {
    const r = await rewrite(word)
    const out = {
      id: word.id,
      example_en: r.example_en,
      example_zh: r.example_zh,
      example_pinyin: pinyinFor(r.example_zh),
      memo_en: r.memo_en || null,
      memo_zh: r.memo_zh || null,
    }
    fs.appendFileSync(OUT_FILE, JSON.stringify(out) + '\n')
    okCount++
    if (okCount % 10 === 0) {
      const speed = okCount / ((Date.now() - startedAt) / 1000)
      console.log(`  ✓ ${okCount}/${todo.length}  (${speed.toFixed(1)}/s)  最新: ${word.id} → ${r.example_en} / ${r.example_zh}`)
    }
  } catch (e) {
    errCount++
    console.error(`  ✗ ${word.id}: ${e.message}`)
  }
}

// 简易并发
async function runBatched() {
  const queue = [...todo]
  const workers = Array(CONCURRENCY).fill(0).map(async () => {
    while (queue.length) {
      const w = queue.shift()
      await worker(w)
    }
  })
  await Promise.all(workers)
}

await runBatched()
console.log(`\n✅ 完成 ${okCount} 条，失败 ${errCount} 条，输出 → ${OUT_FILE}`)
