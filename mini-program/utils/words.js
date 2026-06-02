// 词库（小程序版）— 精简到 12 词作 demo，扩展直接照搬主项目 src/data/words.js
const WORDS = [
  { id:'corn', emoji:'🌽', en:'Corn', zh:'玉米', uk:'/kɔːn/', us:'/kɔːrn/', cat:'food',
    ex_en:'Pop the corn in the microwave.', ex_zh:'把玉米放进微波炉爆开。',
    memo_en:'"Pop-corn" = corn that pops in the pan.', memo_zh:'"爆米花"= 在锅里"砰"地炸开的玉米。' },
  { id:'carrot', emoji:'🥕', en:'Carrot', zh:'胡萝卜', uk:'/ˈkærət/', us:'/ˈkærət/', cat:'food',
    ex_en:'Use a carrot and a stick.', ex_zh:'用胡萝卜加大棒。',
    memo_en:'Hang a carrot in front, hit with a stick behind.', memo_zh:'前面挂胡萝卜引诱，后面拿棒子驱赶。' },
  { id:'apple', emoji:'🍎', en:'Apple', zh:'苹果', uk:'/ˈæp.l̩/', us:'/ˈæp.l̩/', cat:'food',
    ex_en:'An apple a day keeps the doctor away.', ex_zh:'一天一苹果，医生远离我。',
    memo_en:'"Apple of my eye" = my dearest one.', memo_zh:'"掌上明珠"原文是 apple of my eye。' },
  { id:'banana', emoji:'🍌', en:'Banana', zh:'香蕉', uk:'/bəˈnɑːnə/', us:'/bəˈnænə/', cat:'food',
    ex_en:'He went bananas over the news.', ex_zh:'他听到消息后乐疯了。',
    memo_en:'"Go bananas" = go crazy.', memo_zh:'"go bananas" = 高兴到发疯。' },
  { id:'velcro', emoji:'🧷', en:'Velcro', zh:'魔术贴', uk:'/ˈvel.krəʊ/', us:'/ˈvel.kroʊ/', cat:'daily',
    ex_en:'Sneakers with Velcro straps.', ex_zh:'带魔术贴的运动鞋。',
    memo_en:'French velours + crochet (hook).', memo_zh:'法语"天鹅绒"+"钩子"。' },
  { id:'umbrella', emoji:'☂️', en:'Umbrella', zh:'雨伞', uk:'/ʌmˈbrel.ə/', us:'/ʌmˈbrel.ə/', cat:'daily',
    ex_en:'Under the umbrella of the policy.', ex_zh:'在这项政策的"伞"下。',
    memo_en:'From Latin "umbra" = shadow.', memo_zh:'拉丁语 umbra（阴影）。' },
  { id:'mug', emoji:'☕', en:'Mug', zh:'马克杯', uk:'/mʌɡ/', us:'/mʌɡ/', cat:'daily',
    ex_en:'A mug of cocoa warms your hands.', ex_zh:'一杯可可暖手。',
    memo_en:'Mug also = face → mugshot.', memo_zh:'mug 也指"脸"→ mugshot = 警局大头照。' },
  { id:'panda', emoji:'🐼', en:'Panda', zh:'熊猫', uk:'/ˈpæn.də/', us:'/ˈpæn.də/', cat:'animal',
    ex_en:"Kung Fu Panda's Po loves dumplings.", ex_zh:'功夫熊猫阿宝爱吃包子。',
    memo_en:'From Nepali "ponya" = bamboo-eater.', memo_zh:'词源可能为尼泊尔语 ponya（吃竹子者）。' },
  { id:'sneaker', emoji:'👟', en:'Sneaker', zh:'运动鞋', uk:'/ˈsniː.kər/', us:'/ˈsniː.kɚ/', cat:'clothing',
    ex_en:'Sneakerheads queue for Jordans.', ex_zh:'球鞋发烧友排队抢乔丹。',
    memo_en:'Sneak + rubber soles = quiet shoes.', memo_zh:'胶底走路没声音，像"溜"过来。' },
  { id:'scissors', emoji:'✂️', en:'Scissors', zh:'剪刀', uk:'/ˈsɪz.əz/', us:'/ˈsɪz.ɚz/', cat:'office',
    ex_en:'Rock, paper, scissors!', ex_zh:'石头剪子布！',
    memo_en:'Always plural: "a pair of scissors".', memo_zh:'永远复数：a pair of scissors。' },
  { id:'kettle', emoji:'🫖', en:'Kettle', zh:'水壶', uk:'/ˈket.l̩/', us:'/ˈket̬.l̩/', cat:'kitchen',
    ex_en:"Put the kettle on, let's chat.", ex_zh:'烧上水壶吧，咱们聊聊。',
    memo_en:'UK soul-soothing ritual.', memo_zh:'英国精神慰藉关键词。' },
  { id:'fridge', emoji:'🧊', en:'Fridge', zh:'冰箱', uk:'/frɪdʒ/', us:'/frɪdʒ/', cat:'kitchen',
    ex_en:"Nothing in the fridge — order food.", ex_zh:'冰箱啥也没有——叫外卖。',
    memo_en:'Short for refrigerator (extra "d"!).', memo_zh:'refrigerator 的缩写，多了个"d"。' }
]

const WORD_MAP = {}
WORDS.forEach(w => { WORD_MAP[w.id] = w })

module.exports = { WORDS, WORD_MAP }
