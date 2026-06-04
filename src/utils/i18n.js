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
  playBtn:       '开始学习',
  reviewBtn:     '复习单词',
  rewardBtn:     '领取奖励',

  // 选关页
  stagesTitle:   '主题',
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
  quitTitle:     '离开本关？',
  quitSub:       '当前进度将丢失',
  quitConfirm:   '离开',
  quitCancel:    '继续玩',

  // 新手引导
  onboardTitle1: '点 3 个一样的',
  onboardText1:  '找到 3 张相同的卡片点击 → 自动消除',
  onboardTitle2: '学到新词',
  onboardText2:  '消除后弹出单词卡 — 看中英文、听发音',
  onboardTitle3: '托盘别满',
  onboardText3:  '没消除的牌进托盘，满 7 格就输了 🥲',
  onboardSkip:   '跳过',
  onboardNext:   '下一步',
  onboardStart:  '开始玩！',

  // 词卡
  cardContinue:  '继续 Continue',
  expandShow:    '深入了解 · Tell me more',
  expandHide:    '收起',
  exampleTitle:  '例句 · Example',
  memoTitle:     '记住它 · Remember',

  // 难度
  diffLabels:    ['', '入门', '进阶', '中级', '高级', '挑战'],

  // 通用 sub 页面
  back:          '返回',
  cancel:        '取消',
  confirm:       '确定',

  // 设置 Settings
  settingsTitle:     '设置',
  settingsAudio:     '音频',
  settingsSfx:       '🔔 操作音效',
  settingsLearning:  '学习偏好',
  settingsMode:      '🌏 学习模式',
  settingsModeEN:    '我学英语 🇨🇳→🇬🇧',
  settingsModeZH:    'Learn 中文 🇬🇧→🇨🇳',
  settingsAccent:    '📢 默认发音',
  settingsAccentUK:  '英音 🇬🇧',
  settingsAccentUS:  '美音 🇺🇸',
  settingsPreview:   '🎧 试听语音',
  settingsGoal:      '🎯 每日目标',
  settingsTTSEngine: '语音引擎',
  settingsTTSProvider: '当前 provider',
  settingsTTSModel:    '模型',
  settingsTTSUK:       '英音 voice',
  settingsTTSUS:       '美音 voice',
  settingsData:        '数据',
  settingsClearData:   '🗑 清除所有数据',
  settingsConfirmClear:'确定清除所有学习记录？',

  // 签到 Daily
  dailyTitle:        '每日签到',
  dailyStreakSub:    n => `连续 ${n} 天`,
  dailyBannerTitle:  '坚持 7 天',
  dailyBannerSub:    '奖励翻倍 · 解锁专属称号',
  dailyDay:          n => `第 ${n} 天`,
  dailyRewardShuffle:'洗牌',
  dailyRewardUndo:   '撤回',
  dailyRewardGrand:  '大奖',
  dailyBtnReady:     '领取今日奖励',
  dailyBtnClaimed:   '今日已领 · 明天再来',

  // 排行 Ranking
  rankingTitle:      '排行榜',
  rankingSubtitle:   '本周',
  rankingYou:        '你 🐼',
  rankingNote:       '🚧 当前为本地演示数据；接入后端后会显示真实排名',

  // 复习 Review
  reviewTitle:       '单词本',
  reviewLocked:      '消除 3 个解锁',

  // 关于 About
  aboutTitle:        '关于',
  aboutTagline:      'English Match — 三消的玩法，单词卡的快感',
  aboutHowTitle:     '🎮 怎么玩',
  aboutHowText:      '点击棋盘上没被遮挡的卡片，凑齐 3 张相同就消除，每次消除会弹出该词的英文 / 中文 / 英美音标 / 发音。卡满 7 格未消除则失败。',
  aboutVocabTitle:   '📚 词库',
  aboutVocabText:    '3000+ 词，覆盖食物 / 生活 / 旅游短句 / 高频词汇等 10+ 主题。每个词都有中英双语例句和记忆点。',
  aboutAudioTitle:   '🔊 发音',
  aboutAudioText:    'OpenAI gpt-4o-mini-tts 预生成 mp3 + CDN 分发，所有用户听到一致的高质量 coral / nova 女声。',
  aboutRoadmapTitle: '🚀 路线图'
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

  playBtn:       'Start Learning',
  reviewBtn:     'Review',
  rewardBtn:     'Rewards',

  stagesTitle:   'Topics',
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
  quitTitle:     'Leave this stage?',
  quitSub:       'Your progress will be lost',
  quitConfirm:   'Leave',
  quitCancel:    'Keep Playing',

  onboardTitle1: 'Tap 3 same tiles',
  onboardText1:  'Find 3 identical tiles → auto clear',
  onboardTitle2: 'Learn the word',
  onboardText2:  'A word card pops up — see translation, hear pronunciation',
  onboardTitle3: "Don't fill the tray",
  onboardText3:  'Unmatched tiles go to the tray. Game over if all 7 fill 🥲',
  onboardSkip:   'Skip',
  onboardNext:   'Next',
  onboardStart:  "Let's Play!",

  cardContinue:  'Continue · 继续',
  expandShow:    'Tell me more · 深入了解',
  expandHide:    'Hide',
  exampleTitle:  'Example · 例句',
  memoTitle:     'Remember · 记住它',

  diffLabels:    ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'],

  back:          'Back',
  cancel:        'Cancel',
  confirm:       'OK',

  settingsTitle:     'Settings',
  settingsAudio:     'Audio',
  settingsSfx:       '🔔 Sound Effects',
  settingsLearning:  'Learning',
  settingsMode:      '🌏 Learning Mode',
  settingsModeEN:    'I learn English 🇨🇳→🇬🇧',
  settingsModeZH:    'Learn 中文 🇬🇧→🇨🇳',
  settingsAccent:    '📢 Default Accent',
  settingsAccentUK:  'UK 🇬🇧',
  settingsAccentUS:  'US 🇺🇸',
  settingsPreview:   '🎧 Preview Voice',
  settingsGoal:      '🎯 Daily Goal',
  settingsTTSEngine: 'Voice Engine',
  settingsTTSProvider: 'Provider',
  settingsTTSModel:    'Model',
  settingsTTSUK:       'UK voice',
  settingsTTSUS:       'US voice',
  settingsData:        'Data',
  settingsClearData:   '🗑 Clear All Data',
  settingsConfirmClear:'Clear all learning data?',

  dailyTitle:        'Daily Check-in',
  dailyStreakSub:    n => `${n} day streak`,
  dailyBannerTitle:  'Keep going 7 days',
  dailyBannerSub:    'Double rewards · unlock title',
  dailyDay:          n => `Day ${n}`,
  dailyRewardShuffle:'Shuffle',
  dailyRewardUndo:   'Undo',
  dailyRewardGrand:  'Grand',
  dailyBtnReady:     'Claim Today\'s Reward',
  dailyBtnClaimed:   'Claimed · Come back tomorrow',

  rankingTitle:      'Ranking',
  rankingSubtitle:   'This Week',
  rankingYou:        'You 🐼',
  rankingNote:       '🚧 Local demo data — real ranking after backend hookup',

  reviewTitle:       'Wordbook',
  reviewLocked:      'Match 3 to unlock',

  aboutTitle:        'About',
  aboutTagline:      'English Match — match-3 fun meets vocab learning',
  aboutHowTitle:     '🎮 How to Play',
  aboutHowText:      'Tap any uncovered tile. Match 3 identical tiles to clear them — a word card pops up showing English / Chinese / IPA / pronunciation. Game over if all 7 tray slots fill up.',
  aboutVocabTitle:   '📚 Vocabulary',
  aboutVocabText:    '3000+ words across 10+ themes: food, daily life, travel phrases, high-frequency vocabulary. Every word has bilingual examples + memory tips.',
  aboutAudioTitle:   '🔊 Audio',
  aboutAudioText:    'OpenAI gpt-4o-mini-tts pregenerated mp3 + CDN delivery. All users hear the same high-quality coral / nova female voice.',
  aboutRoadmapTitle: '🚀 Roadmap'
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
