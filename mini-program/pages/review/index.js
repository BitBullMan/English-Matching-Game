const app = getApp()
const { WORDS, WORD_MAP } = require('../../utils/words.js')
const tts = require('../../utils/speech.js')

Page({
  data: { list: [], learnedSet: {} },
  onShow() {
    const learnedSet = {}
    app.globalData.learned.forEach(id => { learnedSet[id] = true })
    const stats = app.globalData.stats || {}
    const list = WORDS.slice().sort((a, b) => {
      const la = !!learnedSet[a.id], lb = !!learnedSet[b.id]
      if (la !== lb) return la ? -1 : 1
      return (stats[b.id] || 0) - (stats[a.id] || 0)
    }).map(w => ({
      ...w,
      learned: !!learnedSet[w.id],
      count: stats[w.id] || 0
    }))
    this.setData({ list, learnedSet })
  },
  tapWord(e) {
    const id = e.currentTarget.dataset.id
    if (!this.data.learnedSet[id]) return
    tts.play(id, app.globalData.settings.accent)
    const w = WORD_MAP[id]
    wx.showToast({ title: w.en + ' · ' + w.zh, icon: 'none' })
  },
  goBack() { wx.navigateBack() }
})
