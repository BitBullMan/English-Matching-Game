// 关卡系统 — 按主题/难度组织 3151 词条
//
// 每个关卡 = { id, title, emoji, intro, wordCount, layers, difficulty, picker(words) }
// picker 是一个函数，从 ALL_VOCAB 里挑词返回该关卡的词池
// 游戏 GameScreen 根据 picker 选词

// 难度定义：
//   1 入门：3 词 × 2 组 × 2 层（6 张牌 = 1 分钟通关）
//   2 进阶：5 词 × 2 组 × 3 层 (10 张)
//   3 中级：7 词 × 2 组 × 3 层 (14 张)
//   4 高级：8 词 × 3 组 × 4 层 (24 张)
//   5 挑战：12 词 × 3 组 × 5 层 (36 张)

const DIFFICULTY_PRESETS = {
  1: { wordCount: 3, triplesPerWord: 2, layers: 2, boardW: 280, boardH: 240 },
  2: { wordCount: 5, triplesPerWord: 2, layers: 3, boardW: 320, boardH: 300 },
  3: { wordCount: 7, triplesPerWord: 2, layers: 3, boardW: 340, boardH: 360 },
  4: { wordCount: 8, triplesPerWord: 3, layers: 4, boardW: 360, boardH: 400 },
  5: { wordCount: 12, triplesPerWord: 3, layers: 5, boardW: 380, boardH: 440 }
}

// 这些 helper 只用于"主题关卡"（food/home/animal 等）— 严格只取 base WORDS，
// 排除 v_ 前缀的 VOCAB_3000（vocab 词没 emoji，混进来会显示成文字方块）
const filterByCategory = (cat) => (all) => all.filter(w => !w.id?.startsWith('v_') && w.category === cat)
const filterByScenario = (sc) => (all) => all.filter(w => !w.id?.startsWith('v_') && w.scenario === sc)
const filterById = (ids) => (all) => all.filter(w => ids.includes(w.id))

// 取前 N 个（用于把 vocab-3000 分批）
const filterVocabRange = (start, end) => (all) =>
  all.filter(w => w.id && w.id.startsWith('v_')).slice(start, end)

export const STAGES = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🍎 食物组 (3 关递进)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'food-1', emoji: '🍎', title: '水果入门', intro: '苹果、香蕉、葡萄', title_en: 'Fruits 101', intro_en: 'apple, banana, grape',
    difficulty: 1, group: 'food',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'food' && /apple|banana|grape|strawberry|orange|cherry|peach/i.test(w.english))
  },
  {
    id: 'food-2', emoji: '🥦', title: '蔬菜与谷物', intro: '常见蔬菜、面包', title_en: 'Veggies & Grains', intro_en: 'common veggies, bread',
    difficulty: 2, group: 'food',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'food' && /carrot|broccoli|corn|tomato|bread|cheese|egg|rice|noodle/i.test(w.english))
  },
  {
    id: 'food-3', emoji: '☕', title: '饮品与餐点', intro: '咖啡、茶、披萨', title_en: 'Drinks & Meals', intro_en: 'coffee, tea, pizza',
    difficulty: 2, group: 'food',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'food' && /coffee|tea|wine|beer|milk|pizza|hamburger|sushi|cake|cream/i.test(w.english))
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏠 家居组
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'home-1', emoji: '🏠', title: '家居基础', intro: '门、窗、床、沙发', title_en: 'Home Basics', intro_en: 'door, window, bed, sofa',
    difficulty: 1, group: 'home',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'home' && /door|window|bed|sofa|key|clock/i.test(w.english))
  },
  {
    id: 'home-2', emoji: '🚿', title: '卫浴清洁', intro: '马桶、淋浴、毛巾', title_en: 'Bath & Clean', intro_en: 'toilet, shower, towel',
    difficulty: 2, group: 'home',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'home' && /toilet|shower|bath|soap|broom|mirror/i.test(w.english))
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🐼 动物组
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'animal-1', emoji: '🐱', title: '小动物', intro: '猫狗熊兔', title_en: 'Small Animals', intro_en: 'cat, dog, bear, rabbit',
    difficulty: 1, group: 'animal',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'animal' && /cat|dog|rabbit|mouse|bird|fish/i.test(w.english))
  },
  {
    id: 'animal-2', emoji: '🐯', title: '野生动物', intro: '狮虎象熊', title_en: 'Wild Animals', intro_en: 'lion, tiger, elephant',
    difficulty: 2, group: 'animal',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'animal' && /lion|tiger|bear|elephant|panda/i.test(w.english))
  },
  {
    id: 'animal-3', emoji: '🐮', title: '农场动物', intro: '牛羊马鸡', title_en: 'Farm Animals', intro_en: 'cow, horse, sheep, pig',
    difficulty: 1, group: 'animal',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'animal' && /cow|horse|sheep|pig|chicken/i.test(w.english))
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👕 服饰组
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'clothing-1', emoji: '👕', title: '衣帽鞋袜', intro: 'T恤、裤、鞋', title_en: 'Clothes & Shoes', intro_en: 'T-shirt, pants, shoes',
    difficulty: 2, group: 'clothing',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'clothing')
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚗 交通自然
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'transport-1', emoji: '🚗', title: '交通工具', intro: '车、火车、飞机', title_en: 'Transport', intro_en: 'car, train, plane',
    difficulty: 2, group: 'transport',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'transport')
  },
  {
    id: 'nature-1', emoji: '☀️', title: '自然万物', intro: '日月星云山', title_en: 'Nature', intro_en: 'sun, moon, stars, mountain',
    difficulty: 2, group: 'nature',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'nature')
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧑 身体情绪
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'body-1', emoji: '👁️', title: '五官', intro: '眼耳口鼻', title_en: 'Face', intro_en: 'eye, ear, mouth, nose',
    difficulty: 1, group: 'body',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'body' && /eye|ear|nose|mouth/i.test(w.english))
  },
  {
    id: 'body-2', emoji: '✋', title: '四肢与心脑', intro: '手脚心脑', title_en: 'Body Parts', intro_en: 'hand, foot, heart, brain',
    difficulty: 2, group: 'body',
    picker: (all) => all.filter(w => !w.id.startsWith('v_') && w.category === 'body' && /hand|foot|heart|brain/i.test(w.english))
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💬 旅游短句关卡（按场景 — 给老外学中文/中国人学英语用）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'phrase-greeting', emoji: '👋', title: '问候与寒暄', intro: '你好、再见、谢谢', title_en: 'Greetings', intro_en: 'hi, bye, thanks',
    difficulty: 1, group: 'phrase',
    picker: filterByScenario('greeting')
  },
  {
    id: 'phrase-intro', emoji: '🙋', title: '自我介绍', intro: '我叫…、你来自哪？', title_en: 'Introductions', intro_en: 'My name is..., Where from?',
    difficulty: 2, group: 'phrase',
    picker: filterByScenario('intro')
  },
  {
    id: 'phrase-time', emoji: '⏰', title: '时间与数字', intro: '几点？今天明天', title_en: 'Time & Numbers', intro_en: 'What time? Today, tomorrow',
    difficulty: 1, group: 'phrase',
    picker: filterByScenario('time')
  },
  {
    id: 'phrase-direction', emoji: '🧭', title: '问路', intro: '在哪里？怎么走？', title_en: 'Directions', intro_en: 'Where? How to get there?',
    difficulty: 2, group: 'phrase',
    picker: filterByScenario('direction')
  },
  {
    id: 'phrase-transport', emoji: '🚕', title: '出行交通', intro: '打车、地铁、机场', title_en: 'Getting Around', intro_en: 'taxi, subway, airport',
    difficulty: 2, group: 'phrase',
    picker: filterByScenario('transport')
  },
  {
    id: 'phrase-restaurant', emoji: '🍽️', title: '餐厅点餐', intro: '菜单、推荐、买单', title_en: 'At a Restaurant', intro_en: 'menu, recommend, bill',
    difficulty: 2, group: 'phrase',
    picker: filterByScenario('restaurant')
  },
  {
    id: 'phrase-shopping', emoji: '🛍️', title: '购物砍价', intro: '多少钱？便宜点？', title_en: 'Shopping', intro_en: 'How much? Cheaper?',
    difficulty: 2, group: 'phrase',
    picker: filterByScenario('shopping')
  },
  {
    id: 'phrase-hotel', emoji: '🏨', title: '酒店入住', intro: 'Check-in、Wi-Fi、退房', title_en: 'Hotel Check-in', intro_en: 'check-in, Wi-Fi, check-out',
    difficulty: 3, group: 'phrase',
    picker: filterByScenario('hotel')
  },
  {
    id: 'phrase-emergency', emoji: '🆘', title: '紧急求助', intro: '救命、医院、警察', title_en: 'Emergency', intro_en: 'help, hospital, police',
    difficulty: 2, group: 'phrase',
    picker: filterByScenario('emergency')
  },
  {
    id: 'phrase-polite', emoji: '🙏', title: '礼貌用语', intro: '请、对不起、是的', title_en: 'Polite Phrases', intro_en: 'please, sorry, yes',
    difficulty: 1, group: 'phrase',
    picker: filterByScenario('polite')
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📖 扩展高频词（500 词分 5 关，每关 100 词随机抽）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'vocab-top100', emoji: '📚', title: '高频 1-100', intro: 'Google 词频前 100', title_en: 'Top 1-100', intro_en: 'Google top 100 words',
    difficulty: 3, group: 'vocab',
    picker: filterVocabRange(0, 100)
  },
  {
    id: 'vocab-101-200', emoji: '📚', title: '高频 101-200', intro: '常见名词动词', title_en: 'Top 101-200', intro_en: 'common nouns & verbs',
    difficulty: 3, group: 'vocab',
    picker: filterVocabRange(100, 200)
  },
  {
    id: 'vocab-201-300', emoji: '📚', title: '高频 201-300', intro: '日常常用', title_en: 'Top 201-300', intro_en: 'daily essentials',
    difficulty: 4, group: 'vocab',
    picker: filterVocabRange(200, 300)
  },
  {
    id: 'vocab-301-400', emoji: '📚', title: '高频 301-400', intro: '进阶词汇', title_en: 'Top 301-400', intro_en: 'intermediate vocabulary',
    difficulty: 4, group: 'vocab',
    picker: filterVocabRange(300, 400)
  },
  {
    id: 'vocab-401-500', emoji: '📚', title: '高频 401-500', intro: '挑战级', title_en: 'Top 401-500', intro_en: 'challenge level',
    difficulty: 5, group: 'vocab',
    picker: filterVocabRange(400, 500)
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎲 综合挑战
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'mixed-easy', emoji: '🎲', title: '混合·入门', intro: '所有主题随机', title_en: 'Mixed · Easy', intro_en: 'random from all topics',
    difficulty: 2, group: 'mixed',
    picker: (all) => all.filter(w => w.emoji && w.category !== 'phrase' && w.category && !w.id.startsWith('v_'))
  },
  {
    id: 'mixed-hard', emoji: '🔥', title: '综合·高阶', intro: '词+短句混合', title_en: 'Mixed · Hard', intro_en: 'words + phrases combined',
    difficulty: 4, group: 'mixed',
    picker: (all) => all.filter(w => w.emoji)
  }
]

// 关卡组（用于关卡选择页分组显示）
export const STAGE_GROUPS = [
  { id: 'food',      label: '🍎 食物',     label_en: '🍎 Food',         color: '#ff8c42' },
  { id: 'home',      label: '🏠 家居',     label_en: '🏠 Home',         color: '#6fc6ff' },
  { id: 'animal',    label: '🐼 动物',     label_en: '🐼 Animals',      color: '#a3d36a' },
  { id: 'clothing',  label: '👕 服饰',     label_en: '👕 Clothing',     color: '#b076ff' },
  { id: 'transport', label: '🚗 交通',     label_en: '🚗 Transport',    color: '#ff7aa8' },
  { id: 'nature',    label: '🌳 自然',     label_en: '🌳 Nature',       color: '#6fb91c' },
  { id: 'body',      label: '🧑 身体',     label_en: '🧑 Body',         color: '#ffd24a' },
  { id: 'phrase',    label: '💬 旅游短句', label_en: '💬 Travel Phrases', color: '#d8395d' },
  { id: 'vocab',     label: '📚 扩展词汇', label_en: '📚 Vocabulary',   color: '#9ed838' },
  { id: 'mixed',     label: '🎲 综合挑战', label_en: '🎲 Mixed Challenge', color: '#ff5e9b' }
]

// 难度的展示
export const DIFFICULTY_LABELS = {
  1: { stars: '⭐',         label: '入门', label_en: 'Beginner' },
  2: { stars: '⭐⭐',       label: '进阶', label_en: 'Easy' },
  3: { stars: '⭐⭐⭐',     label: '中级', label_en: 'Medium' },
  4: { stars: '⭐⭐⭐⭐',   label: '高级', label_en: 'Hard' },
  5: { stars: '⭐⭐⭐⭐⭐', label: '挑战', label_en: 'Expert' }
}

// 根据 difficulty 拿游戏预设
export function getLevelOpt(difficulty) {
  return DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS[2]
}

// 按 id 查找关卡
export function getStage(id) {
  return STAGES.find(s => s.id === id)
}
