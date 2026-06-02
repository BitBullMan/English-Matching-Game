// 词库 —— 字段全部走双语精简（中英并列、单条 ≤ 20 字、直击重点）
// 字段：
//   id, emoji, english, chinese, ipa_uk, ipa_us, category
//   example_en / example_zh   — 一句话例句
//   memo_en   / memo_zh       — 一句话记忆点（最值钱的那 1 个梗）
//   tip_en    / tip_zh        — 可选：用法/英美差异

export const WORDS = [
  // —— 食物 ——
  {
    id: 'corn', emoji: '🌽', english: 'Corn', chinese: '玉米',
    ipa_uk: '/kɔːn/', ipa_us: '/kɔːrn/', category: 'food',
    example_en: 'Pop the corn in the microwave.',
    example_zh: '把玉米放进微波炉爆开。',
    memo_en: '"Pop-corn" = corn that pops in the pan.',
    memo_zh: '"爆米花"= 在锅里"砰"地炸开的玉米。',
    tip_en: 'UK "corn" can mean any grain; US "corn" = maize.',
    tip_zh: '英式 corn 泛指谷物；美式 corn 专指玉米。'
  },
  {
    id: 'carrot', emoji: '🥕', english: 'Carrot', chinese: '胡萝卜',
    ipa_uk: '/ˈkærət/', ipa_us: '/ˈkærət/', category: 'food',
    example_en: 'Use a carrot and a stick.',
    example_zh: '用胡萝卜加大棒（恩威并施）。',
    memo_en: 'Hang a carrot in front, hit with a stick behind.',
    memo_zh: '前面挂胡萝卜引诱，后面拿大棒驱赶。'
  },
  {
    id: 'apple', emoji: '🍎', english: 'Apple', chinese: '苹果',
    ipa_uk: '/ˈæp.l̩/', ipa_us: '/ˈæp.l̩/', category: 'food',
    example_en: 'An apple a day keeps the doctor away.',
    example_zh: '一天一苹果，医生远离我。',
    memo_en: '"Apple of my eye" = my dearest one.',
    memo_zh: '"掌上明珠"原文是 apple of my eye。'
  },
  {
    id: 'banana', emoji: '🍌', english: 'Banana', chinese: '香蕉',
    ipa_uk: '/bəˈnɑːnə/', ipa_us: '/bəˈnænə/', category: 'food',
    example_en: 'He went bananas over the news.',
    example_zh: '他听到消息后乐疯了。',
    memo_en: '"Go bananas" = go crazy (with joy).',
    memo_zh: '"go bananas" = 高兴到发疯。',
    tip_en: 'UK /bəˈnɑːnə/ "ah"; US /bəˈnænə/ "æ".',
    tip_zh: '英音中间"啊"，美音"æ"。'
  },
  {
    id: 'grape', emoji: '🍇', english: 'Grape', chinese: '葡萄',
    ipa_uk: '/ɡreɪp/', ipa_us: '/ɡreɪp/', category: 'food',
    example_en: '"Sour grapes!" said the fox.',
    example_zh: '"葡萄是酸的！"狐狸说。',
    memo_en: '"Sour grapes" = jealous excuse. (Aesop)',
    memo_zh: '"酸葡萄"= 吃不到说酸（伊索寓言）。'
  },
  {
    id: 'broccoli', emoji: '🥦', english: 'Broccoli', chinese: '西兰花',
    ipa_uk: '/ˈbrɒk.əl.i/', ipa_us: '/ˈbrɑː.kə.li/', category: 'food',
    example_en: 'Kids push broccoli to the plate edge.',
    example_zh: '小孩把西兰花推到盘子边。',
    memo_en: 'From Italian "broccolo" = little sprout.',
    memo_zh: '意大利语 broccolo（小芽）演变而来。'
  },
  {
    id: 'avocado', emoji: '🥑', english: 'Avocado', chinese: '牛油果',
    ipa_uk: '/ˌæv.əˈkɑː.dəʊ/', ipa_us: '/ˌæv.əˈkɑː.doʊ/', category: 'food',
    example_en: 'Smashed avocado on toast.',
    example_zh: '牛油果泥配吐司。',
    memo_en: 'From Nahuatl "ahuacatl" — yes, that body part.',
    memo_zh: '词源纳瓦特尔语 ahuacatl（睾丸，因形似）。'
  },
  {
    id: 'cherry', emoji: '🍒', english: 'Cherry', chinese: '樱桃',
    ipa_uk: '/ˈtʃer.i/', ipa_us: '/ˈtʃer.i/', category: 'food',
    example_en: 'The bonus is the cherry on top.',
    example_zh: '奖金是锦上添花。',
    memo_en: '"Cherry on top" = the perfect finishing touch.',
    memo_zh: '"蛋糕顶的樱桃"= 锦上添花。'
  },

  // —— 生活 / 家居 ——
  {
    id: 'velcro', emoji: '🧷', english: 'Velcro', chinese: '魔术贴',
    ipa_uk: '/ˈvel.krəʊ/', ipa_us: '/ˈvel.kroʊ/', category: 'daily',
    example_en: 'Sneakers with Velcro straps.',
    example_zh: '带魔术贴的运动鞋。',
    memo_en: 'French velours (velvet) + crochet (hook).',
    memo_zh: '法语"天鹅绒"+"钩子"合成，灵感来自牛蒡刺果。'
  },
  {
    id: 'drawstring', emoji: '👝', english: 'Drawstring', chinese: '抽绳',
    ipa_uk: '/ˈdrɔːstrɪŋ/', ipa_us: '/ˈdrɑːstrɪŋ/', category: 'daily',
    example_en: 'Pull the drawstring to tighten.',
    example_zh: '拉抽绳收紧。',
    memo_en: 'draw (pull) + string (cord) = pulling cord.',
    memo_zh: 'draw（拉）+ string（绳）= 拉绳。'
  },
  {
    id: 'zipper', emoji: '🤐', english: 'Zipper', chinese: '拉链',
    ipa_uk: '/ˈzɪp.ər/', ipa_us: '/ˈzɪp.ɚ/', category: 'daily',
    example_en: 'Zip it! = Be quiet!',
    example_zh: '"把嘴拉上"= 闭嘴！',
    memo_en: '"Zip" mimics the sound of a zipper.',
    memo_zh: 'zip 模拟拉链"嗖"的声音。',
    tip_en: 'UK: zip. US: zipper.',
    tip_zh: '英式常说 zip，美式说 zipper。'
  },
  {
    id: 'umbrella', emoji: '☂️', english: 'Umbrella', chinese: '雨伞',
    ipa_uk: '/ʌmˈbrel.ə/', ipa_us: '/ʌmˈbrel.ə/', category: 'daily',
    example_en: 'Under the umbrella of the policy.',
    example_zh: '在这项政策的"伞"下。',
    memo_en: 'From Latin "umbra" = shadow maker.',
    memo_zh: '拉丁语 umbra（阴影）—— 制造阴影的东西。'
  },
  {
    id: 'mug', emoji: '☕', english: 'Mug', chinese: '马克杯',
    ipa_uk: '/mʌɡ/', ipa_us: '/mʌɡ/', category: 'daily',
    example_en: 'A mug of cocoa warms your hands.',
    example_zh: '一杯可可暖手。',
    memo_en: 'Mug also = face → mugshot = police photo.',
    memo_zh: 'mug 也指"脸"→ mugshot = 警局大头照。'
  },
  {
    id: 'mirror', emoji: '🪞', english: 'Mirror', chinese: '镜子',
    ipa_uk: '/ˈmɪr.ər/', ipa_us: '/ˈmɪr.ɚ/', category: 'daily',
    example_en: 'Mirror, mirror, on the wall...',
    example_zh: '魔镜魔镜告诉我……',
    memo_en: 'Same root as admire / miracle = "to gaze".',
    memo_zh: '和 admire / miracle 同根，意为"凝视"。'
  },
  {
    id: 'lamp', emoji: '💡', english: 'Lamp', chinese: '台灯',
    ipa_uk: '/læmp/', ipa_us: '/læmp/', category: 'daily',
    example_en: 'Aladdin rubbed the magic lamp.',
    example_zh: '阿拉丁擦了擦神灯。',
    memo_en: 'From Greek "lampas" = torch.',
    memo_zh: '希腊语 lampas（火炬）。'
  },
  {
    id: 'soap', emoji: '🧼', english: 'Soap', chinese: '香皂',
    ipa_uk: '/səʊp/', ipa_us: '/soʊp/', category: 'daily',
    example_en: 'My mom loves Korean soap operas.',
    example_zh: '我妈爱看韩剧（肥皂剧）。',
    memo_en: '"Soap opera" — 1930s radio dramas funded by soap brands.',
    memo_zh: '"肥皂剧"= 1930 年代美国电台剧，肥皂公司赞助。'
  },
  {
    id: 'broom', emoji: '🧹', english: 'Broom', chinese: '扫帚',
    ipa_uk: '/bruːm/', ipa_us: '/bruːm/', category: 'daily',
    example_en: 'A new broom sweeps clean.',
    example_zh: '新官上任三把火。',
    memo_en: "Harry Potter's Nimbus 2000 — a flying broom.",
    memo_zh: '哈利波特的飞天扫帚 Nimbus 2000。'
  },

  // —— 服饰 ——
  {
    id: 'hoodie', emoji: '🧥', english: 'Hoodie', chinese: '连帽衫',
    ipa_uk: '/ˈhʊd.i/', ipa_us: '/ˈhʊd.i/', category: 'clothing',
    example_en: 'Zuckerberg made hoodies tech-CEO uniform.',
    example_zh: '扎克伯格让连帽衫成了科技 CEO 制服。',
    memo_en: 'hood (cap) + -ie (cute suffix). Like selfie, foodie.',
    memo_zh: 'hood（兜帽）+ -ie（爱称）。同类：selfie、foodie。'
  },
  {
    id: 'sneaker', emoji: '👟', english: 'Sneaker', chinese: '运动鞋',
    ipa_uk: '/ˈsniː.kər/', ipa_us: '/ˈsniː.kɚ/', category: 'clothing',
    example_en: 'Sneakerheads queue for limited Jordans.',
    example_zh: '球鞋发烧友排队抢限量乔丹。',
    memo_en: 'Sneak (move silently) — rubber soles = quiet shoes.',
    memo_zh: 'sneak（偷偷溜）+ 胶底走路没声 = 溜的鞋。',
    tip_en: 'UK: trainers. US: sneakers.',
    tip_zh: '英式常说 trainers；美式说 sneakers。'
  },
  {
    id: 'scarf', emoji: '🧣', english: 'Scarf', chinese: '围巾',
    ipa_uk: '/skɑːf/', ipa_us: '/skɑːrf/', category: 'clothing',
    example_en: 'She wrapped a red scarf around her neck.',
    example_zh: '她绕了条红围巾在脖子上。',
    memo_en: 'Plural: scarves or scarfs (both OK).',
    memo_zh: '复数 scarves 或 scarfs 都对。'
  },
  {
    id: 'glove', emoji: '🧤', english: 'Glove', chinese: '手套',
    ipa_uk: '/ɡlʌv/', ipa_us: '/ɡlʌv/', category: 'clothing',
    example_en: 'The dress fits like a glove.',
    example_zh: '这裙子像手套一样合身。',
    memo_en: '"Fit like a glove" — perfectly tailored.',
    memo_zh: '"像手套一样合身"= 完全贴合。'
  },
  {
    id: 'sock', emoji: '🧦', english: 'Sock', chinese: '袜子',
    ipa_uk: '/sɒk/', ipa_us: '/sɑːk/', category: 'clothing',
    example_en: 'That song knocked my socks off!',
    example_zh: '那首歌把我袜子都震飞了（超惊艳）！',
    memo_en: '"Knock your socks off" = amaze you completely.',
    memo_zh: '"把袜子打飞"= 让你大为惊叹。'
  },

  // —— 文具 / 办公 ——
  {
    id: 'stapler', emoji: '📎', english: 'Stapler', chinese: '订书机',
    ipa_uk: '/ˈsteɪ.plər/', ipa_us: '/ˈsteɪ.plɚ/', category: 'office',
    example_en: "Don't take my red stapler!",
    example_zh: '别拿走我的红色订书机！',
    memo_en: "Milton's red Swingline — icon from Office Space (1999).",
    memo_zh: '电影《办公空间》里 Milton 的红订书机已成打工人符号。'
  },
  {
    id: 'notebook', emoji: '📓', english: 'Notebook', chinese: '笔记本',
    ipa_uk: '/ˈnəʊt.bʊk/', ipa_us: '/ˈnoʊt.bʊk/', category: 'office',
    example_en: "Da Vinci's notebooks had flying machine sketches.",
    example_zh: '达·芬奇的笔记本里有飞行器草图。',
    memo_en: 'note + book = notebook. Also: laptop = notebook (CN).',
    memo_zh: 'note（笔记）+ book（本）。中文里"笔记本"也指笔电。'
  },
  {
    id: 'eraser', emoji: '🩹', english: 'Eraser', chinese: '橡皮',
    ipa_uk: '/ɪˈreɪ.zər/', ipa_us: '/ɪˈreɪ.sɚ/', category: 'office',
    example_en: 'Pass me the eraser, please.',
    example_zh: '请把橡皮递给我。',
    memo_en: 'UK kids say "rubber" — careful, in US it means condom!',
    memo_zh: '英式叫 rubber——小心，美式 rubber 是避孕套！'
  },
  {
    id: 'scissors', emoji: '✂️', english: 'Scissors', chinese: '剪刀',
    ipa_uk: '/ˈsɪz.əz/', ipa_us: '/ˈsɪz.ɚz/', category: 'office',
    example_en: 'Rock, paper, scissors!',
    example_zh: '石头剪子布！',
    memo_en: 'Always plural: "a pair of scissors". Two blades.',
    memo_zh: '永远复数：a pair of scissors（两片刀刃）。'
  },

  // —— 厨房 ——
  {
    id: 'kettle', emoji: '🫖', english: 'Kettle', chinese: '水壶',
    ipa_uk: '/ˈket.l̩/', ipa_us: '/ˈket̬.l̩/', category: 'kitchen',
    example_en: "Put the kettle on, let's chat.",
    example_zh: '烧上水壶吧，咱们聊聊。',
    memo_en: 'In UK: "putting the kettle on" = soul-soothing ritual.',
    memo_zh: '英国精神慰藉关键词，约等于"我累了/我们聊聊吧"。'
  },
  {
    id: 'spatula', emoji: '🥄', english: 'Spatula', chinese: '锅铲',
    ipa_uk: '/ˈspæt.jʊ.lə/', ipa_us: '/ˈspætʃ.ə.lə/', category: 'kitchen',
    example_en: 'Flip the pancake with a spatula.',
    example_zh: '用锅铲翻煎饼。',
    memo_en: 'Same root as "sword" — both are flat blades.',
    memo_zh: '和 sword（剑）同源 —— 都是扁平的"刀"。'
  },
  {
    id: 'blender', emoji: '🥤', english: 'Blender', chinese: '搅拌机',
    ipa_uk: '/ˈblen.dər/', ipa_us: '/ˈblen.dɚ/', category: 'kitchen',
    example_en: 'Toss strawberries in the blender.',
    example_zh: '把草莓丢进搅拌机。',
    memo_en: 'blend (mix) + -er (tool) = mixing tool.',
    memo_zh: 'blend（混合）+ -er（工具）。'
  },
  {
    id: 'fridge', emoji: '🧊', english: 'Fridge', chinese: '冰箱',
    ipa_uk: '/frɪdʒ/', ipa_us: '/frɪdʒ/', category: 'kitchen',
    example_en: "Nothing in the fridge — let's order food.",
    example_zh: '冰箱啥也没有——叫外卖吧。',
    memo_en: 'Short for refrigerator (note the extra "d"!).',
    memo_zh: 'refrigerator 的口语缩写——注意多个"d"！'
  },

  // —— 动物 ——
  {
    id: 'owl', emoji: '🦉', english: 'Owl', chinese: '猫头鹰',
    ipa_uk: '/aʊl/', ipa_us: '/aʊl/', category: 'animal',
    example_en: "He's a night owl — works till 3 a.m.",
    example_zh: '他是夜猫子——干到凌晨 3 点。',
    memo_en: '"Night owl" = a nocturnal person.',
    memo_zh: '"夜猫子"= 喜欢熬夜的人。'
  },
  {
    id: 'sheep', emoji: '🐑', english: 'Sheep', chinese: '羊',
    ipa_uk: '/ʃiːp/', ipa_us: '/ʃiːp/', category: 'animal',
    example_en: "Count sheep when you can't sleep.",
    example_zh: '睡不着就数羊。',
    memo_en: 'Singular = plural: one sheep, two sheep.',
    memo_zh: '单复数同形：one sheep, two sheep。'
  },
  {
    id: 'panda', emoji: '🐼', english: 'Panda', chinese: '熊猫',
    ipa_uk: '/ˈpæn.də/', ipa_us: '/ˈpæn.də/', category: 'animal',
    example_en: "Kung Fu Panda's Po loves dumplings.",
    example_zh: '功夫熊猫阿宝爱吃包子。',
    memo_en: 'Maybe from Nepali "ponya" = bamboo-eater.',
    memo_zh: '词源可能为尼泊尔语 ponya（吃竹子者）。'
  }
]

export const WORD_MAP = Object.fromEntries(WORDS.map(w => [w.id, w]))
