// 小程序入口
App({
  globalData: {
    coins: 0,
    learned: [],   // wordId[]
    stats: {},     // { wordId: count }
    settings: { music: true, sfx: true, accent: 'uk' }
  },

  onLaunch() {
    // 读持久化
    try {
      const c = wx.getStorageSync('coins')
      const l = wx.getStorageSync('learned')
      const s = wx.getStorageSync('stats')
      const set = wx.getStorageSync('settings')
      if (c) this.globalData.coins = c
      if (l) this.globalData.learned = l
      if (s) this.globalData.stats = s
      if (set) this.globalData.settings = { ...this.globalData.settings, ...set }
    } catch (_) {}
  },

  save() {
    try {
      wx.setStorageSync('coins', this.globalData.coins)
      wx.setStorageSync('learned', this.globalData.learned)
      wx.setStorageSync('stats', this.globalData.stats)
      wx.setStorageSync('settings', this.globalData.settings)
    } catch (_) {}
  }
})
