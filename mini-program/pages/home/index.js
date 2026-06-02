const app = getApp()
const { WORDS } = require('../../utils/words.js')

Page({
  data: {
    coins: 0,
    learnedCount: 0,
    totalCount: WORDS.length,
    pct: 0
  },
  onShow() {
    const coins = app.globalData.coins
    const learned = app.globalData.learned.length
    this.setData({
      coins,
      learnedCount: learned,
      pct: Math.round(learned / WORDS.length * 100)
    })
  },
  goGame() {
    wx.navigateTo({ url: '/pages/game/index' })
  },
  goReview() {
    wx.navigateTo({ url: '/pages/review/index' })
  },
  goAbout() {
    wx.navigateTo({ url: '/pages/about/index' })
  }
})
