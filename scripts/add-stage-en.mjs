/**
 * 给 stages.js 每个 stage 加 title_en / intro_en
 * 手工映射表（一次性），写回 stages.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = path.join(ROOT, 'src/data/stages.js')

// id → { title_en, intro_en }
const I18N = {
  'food-1':           { title_en: 'Fruits 101',         intro_en: 'apple, banana, grape' },
  'food-2':           { title_en: 'Veggies & Grains',   intro_en: 'common veggies, bread' },
  'food-3':           { title_en: 'Drinks & Meals',     intro_en: 'coffee, tea, pizza' },
  'home-1':           { title_en: 'Home Basics',        intro_en: 'door, window, bed, sofa' },
  'home-2':           { title_en: 'Bath & Clean',       intro_en: 'toilet, shower, towel' },
  'animal-1':         { title_en: 'Small Animals',      intro_en: 'cat, dog, bear, rabbit' },
  'animal-2':         { title_en: 'Wild Animals',       intro_en: 'lion, tiger, elephant' },
  'animal-3':         { title_en: 'Farm Animals',       intro_en: 'cow, horse, sheep, pig' },
  'clothing-1':       { title_en: 'Clothes & Shoes',    intro_en: 'T-shirt, pants, shoes' },
  'transport-1':      { title_en: 'Transport',          intro_en: 'car, train, plane' },
  'nature-1':         { title_en: 'Nature',             intro_en: 'sun, moon, stars, mountain' },
  'body-1':           { title_en: 'Face',               intro_en: 'eye, ear, mouth, nose' },
  'body-2':           { title_en: 'Body Parts',         intro_en: 'hand, foot, heart, brain' },
  'phrase-greeting':  { title_en: 'Greetings',          intro_en: 'hi, bye, thanks' },
  'phrase-intro':     { title_en: 'Introductions',      intro_en: 'My name is..., Where from?' },
  'phrase-time':      { title_en: 'Time & Numbers',     intro_en: 'What time? Today, tomorrow' },
  'phrase-direction': { title_en: 'Directions',         intro_en: 'Where? How to get there?' },
  'phrase-transport': { title_en: 'Getting Around',     intro_en: 'taxi, subway, airport' },
  'phrase-restaurant':{ title_en: 'At a Restaurant',    intro_en: 'menu, recommend, bill' },
  'phrase-shopping':  { title_en: 'Shopping',           intro_en: 'How much? Cheaper?' },
  'phrase-hotel':     { title_en: 'Hotel Check-in',     intro_en: 'check-in, Wi-Fi, check-out' },
  'phrase-emergency': { title_en: 'Emergency',          intro_en: 'help, hospital, police' },
  'phrase-polite':    { title_en: 'Polite Phrases',     intro_en: 'please, sorry, yes' },
  'vocab-top100':     { title_en: 'Top 1-100',          intro_en: 'Google top 100 words' },
  'vocab-101-200':    { title_en: 'Top 101-200',        intro_en: 'common nouns & verbs' },
  'vocab-201-300':    { title_en: 'Top 201-300',        intro_en: 'daily essentials' },
  'vocab-301-400':    { title_en: 'Top 301-400',        intro_en: 'intermediate vocabulary' },
  'vocab-401-500':    { title_en: 'Top 401-500',        intro_en: 'challenge level' },
  'mixed-easy':       { title_en: 'Mixed · Easy',       intro_en: 'random from all topics' },
  'mixed-hard':       { title_en: 'Mixed · Hard',       intro_en: 'words + phrases combined' },
}

let src = fs.readFileSync(TARGET, 'utf8')
let applied = 0, missed = []

for (const [id, m] of Object.entries(I18N)) {
  const idEsc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 匹配 `id: 'xxx', emoji: '...', title: '...', intro: '...'`
  // 在 intro 后插入 title_en + intro_en
  const re = new RegExp(`(id:\\s*['"]${idEsc}['"][\\s\\S]*?intro:\\s*['"][^'"]*['"])`)
  const matched = re.exec(src)
  if (!matched) { missed.push(id); continue }
  // 跳过已存在
  if (src.slice(matched.index, matched.index + matched[0].length + 60).includes('title_en')) {
    applied++; continue
  }
  const insertion = `, title_en: '${m.title_en}', intro_en: '${m.intro_en}'`
  src = src.slice(0, matched.index + matched[0].length) + insertion + src.slice(matched.index + matched[0].length)
  applied++
}

fs.writeFileSync(TARGET, src)
console.log(`✅ 加 ${applied} 个 stage 的 _en 字段`)
if (missed.length) console.warn('未匹配:', missed)
