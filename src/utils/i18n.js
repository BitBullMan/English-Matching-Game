// UI 文案国际化
// learnMode='en'  → 中国人学英语 → UI 用中文（getCurrentLang() = 'zh'）
// learnMode='zh'  → 英语母语学中文 → UI 用英文（getCurrentLang() = 'en'）
//
// 用法：import { t } from '../utils/i18n.js'; t('playBtn')

import { store } from './store.js'

export function getCurrentLang() {
  const learnMode = (store.getSettings().learnMode || 'en')
  return learnMode === 'en' ? 'zh' : 'en'   // 反转 — UI 语言 = 用户母语
}

const ZH = {
  // 通用
  appTitleMain:  '消消学英语',
  appTitleSub:   'English Match',
  bubble:        '🎋 一起学新词吧！',

  // 顶部 pill
  coin:          '金币',
  streak:        n => `🔥 连续 ${n} 天`,

  // 侧栏入口
  wordbook:      '单词本',
  daily:         '每日签到',
  ranking:       '排行榜',
  settings:      '设置',
  about:         '关于',

  // 主页统计
  learned:       '已学',
  vocabSize:     '词库',
  completed:     '完成',

  // 主 CTA
  playBtn:       '选关挑战',
  reviewBtn:     '复习单词',
  rewardBtn:     '领取奖励',

  // 选关页
  stagesTitle:   '关卡选择',
  wordCount:     n => `${n} 词`,

  // 游戏 HUD
  learnedShort:  n => `已学 ${n}`,
  stageLabel:    s => `关卡 ${s}`,
  combo:         '连击',

  // 工具按钮
  toolRemove:    '移出',
  toolUndo:      '撤回',
  toolShuffle:   '洗牌',

  // 弹窗
  winTitle:      '🎉 通关！',
  winSub:        (n, c) => `本局学到 ${n} 个词 · 共 ${c} 金币`,
  winBtn:        '再来一关',
  loseTitle:     '😅 槽位满了',
  loseSub:       '试试洗牌或重开',
  loseBtn:       '重新开始',

  // 词卡
  cardContinue:  '继续 Continue',
  expandShow:    '深入了解 · Tell me more',
  expandHide:    '收起',
  exampleTitle:  '例句 · Example',
  memoTitle:     '记住它 · Remember',

  // 难度
  diffLabels:    ['', '入门', '进阶', '中级', '高级', '挑战']
}

const EN = {
  appTitleMain:  'English Match',
  appTitleSub:   '消消学英语',
  bubble:        '🎋 Hi! Let\'s learn 中文 today!',

  coin:          'Coins',
  streak:        n => `🔥 ${n} day streak`,

  wordbook:      'Wordbook',
  daily:         'Daily Check-in',
  ranking:       'Ranking',
  settings:      'Settings',
  about:         'About',

  learned:       'Learned',
  vocabSize:     'Words',
  completed:     'Done',

  playBtn:       'Pick a Stage',
  reviewBtn:     'Review',
  rewardBtn:     'Rewards',

  stagesTitle:   'Choose a Stage',
  wordCount:     n => `${n} words`,

  learnedShort:  n => `Learned ${n}`,
  stageLabel:    s => `Stage ${s}`,
  combo:         'Combo',

  toolRemove:    'Remove',
  toolUndo:      'Undo',
  toolShuffle:   'Shuffle',

  winTitle:      '🎉 You Win!',
  winSub:        (n, c) => `Learned ${n} words · ${c} coins`,
  winBtn:        'Play Again',
  loseTitle:     '😅 Tray Full',
  loseSub:       'Try shuffle or restart',
  loseBtn:       'Restart',

  cardContinue:  'Continue · 继续',
  expandShow:    'Tell me more · 深入了解',
  expandHide:    'Hide',
  exampleTitle:  'Example · 例句',
  memoTitle:     'Remember · 记住它',

  diffLabels:    ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert']
}

const DICT = { zh: ZH, en: EN }

export function t(key, ...args) {
  const lang = getCurrentLang()
  const v = (DICT[lang] && DICT[lang][key]) ?? (DICT.zh[key])
  return typeof v === 'function' ? v(...args) : v
}

// 给数据层用：从一个 {x, x_en} 对象返回 x_en 或 x（按 UI 语言）
export function tField(obj, field) {
  const lang = getCurrentLang()
  if (lang === 'en' && obj[field + '_en']) return obj[field + '_en']
  return obj[field]
}
