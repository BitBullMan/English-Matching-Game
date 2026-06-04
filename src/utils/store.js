// localStorage 持久化层
// 包装统一的 get/set，避免组件里散落写 localStorage

const NS = 'eng-match-v1'

function read(key, def) {
  try {
    const raw = localStorage.getItem(`${NS}:${key}`)
    if (raw == null) return def
    return JSON.parse(raw)
  } catch (_) {
    return def
  }
}
function write(key, val) {
  try { localStorage.setItem(`${NS}:${key}`, JSON.stringify(val)) } catch (_) {}
}

export const store = {
  // 游戏进度
  getCoins:   () => read('coins', 0),
  setCoins:   v => write('coins', v),

  getLearned: () => new Set(read('learned', [])),
  setLearned: set => write('learned', Array.from(set)),

  // 单词学习次数：{ wordId: { count, lastAt } }
  getStats:   () => read('stats', {}),
  setStats:   v => write('stats', v),
  bumpStat(wordId) {
    const s = read('stats', {})
    const cur = s[wordId] || { count: 0, lastAt: 0 }
    s[wordId] = { count: cur.count + 1, lastAt: Date.now() }
    write('stats', s)
    return s
  },

  // 设置
  getSettings: () => read('settings', {
    sfx: true,
    defaultAccent: 'uk',
    dailyGoal: 8,
    // 学习模式：'en' (中国人学英语) | 'zh' (英语母语者学中文)
    learnMode: 'en'
  }),
  setSettings: v => write('settings', v),

  // 每日签到
  getCheckin: () => read('checkin', { last: null, streak: 0, claimedDays: [] }),
  setCheckin: v => write('checkin', v),

  // 关卡进度：{ stageId: { passed: 通关次数, bestCombo: N, lastPlayedAt: ts } }
  getStageProgress: () => read('stageProgress', {}),
  setStageProgress: v => write('stageProgress', v),
  markStagePassed(stageId) {
    const p = read('stageProgress', {})
    const cur = p[stageId] || { passed: 0 }
    p[stageId] = { ...cur, passed: cur.passed + 1, lastPlayedAt: Date.now() }
    write('stageProgress', p)
    return p
  }
}

// 今天的 yyyy-mm-dd 字符串（按本地时区）
export function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
