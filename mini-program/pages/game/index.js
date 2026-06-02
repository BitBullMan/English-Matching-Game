const app = getApp()
const { WORDS, WORD_MAP } = require('../../utils/words.js')
const { generateLevel, isCovered, TILE_SIZE } = require('../../utils/level.js')
const tts = require('../../utils/speech.js')

const TRAY = 7
const COMBO_WORDS = ['NICE!', 'COOL!', 'GREAT!', 'EXCELLENT!', 'AMAZING!', 'BRAVO!']

Page({
  data: {
    tiles: [],
    coveredMap: {},
    tray: [],
    history: [],
    card: null,        // 当前展示的单词
    coins: 0,
    combo: 0,
    pop: '',
    tools: { remove: 3, undo: 5, shuffle: 3 },
    TILE: TILE_SIZE,
    endTitle: '',
    endText: ''
  },

  onLoad() {
    this.newGame()
  },

  onShow() {
    this.setData({ coins: app.globalData.coins })
  },

  newGame() {
    const lv = generateLevel(WORDS, { wordCount: 6, triplesPerWord: 2, layers: 3, boardW: 560, boardH: 600 })
    this._tiles = lv.tiles
    this.setData({
      tiles: this._tilesWithMeta(),
      coveredMap: this._covered(),
      tray: [], history: [],
      card: null, combo: 0, pop: '',
      tools: { remove: 3, undo: 5, shuffle: 3 },
      endTitle: '', endText: ''
    })
  },

  _tilesWithMeta() {
    return this._tiles
      .slice()
      .sort((a, b) => a.layer - b.layer)
      .map(t => ({ ...t, emoji: WORD_MAP[t.wordId].emoji }))
  },

  _covered() {
    const m = {}
    this._tiles.forEach(t => { m[t.id] = isCovered(t, this._tiles) })
    return m
  },

  tapTile(e) {
    const id = e.currentTarget.dataset.id
    const t = this._tiles.find(x => x.id === id)
    if (!t || this.data.coveredMap[id]) return
    if (this.data.card) return
    if (this.data.tray.length >= TRAY) return

    const nt = this.data.tray.slice()
    let at = nt.length
    for (let i = nt.length - 1; i >= 0; i--) {
      if (nt[i].wordId === t.wordId) { at = i + 1; break }
    }
    nt.splice(at, 0, t)
    this._tiles = this._tiles.filter(x => x.id !== t.id)
    const newHistory = this.data.history.concat([t])

    const counts = {}
    nt.forEach(x => { counts[x.wordId] = (counts[x.wordId] || 0) + 1 })
    const matched = Object.keys(counts).find(k => counts[k] >= 3)

    if (matched) {
      const cleared = nt.filter(x => x.wordId !== matched)
      const newCombo = this.data.combo + 1
      const newCoins = this.data.coins + 30
      app.globalData.coins = newCoins
      if (app.globalData.learned.indexOf(matched) < 0) app.globalData.learned.push(matched)
      app.globalData.stats[matched] = (app.globalData.stats[matched] || 0) + 1
      app.save()

      const pop = COMBO_WORDS[Math.floor(Math.random() * COMBO_WORDS.length)]
      this.setData({
        tiles: this._tilesWithMeta(),
        coveredMap: this._covered(),
        tray: cleared,
        history: [],
        coins: newCoins,
        combo: newCombo,
        pop
      })
      setTimeout(() => this.setData({ pop: '' }), 900)
      setTimeout(() => {
        this.setData({ card: WORD_MAP[matched] })
        tts.play(matched, app.globalData.settings.accent)
      }, 360)
    } else {
      this.setData({
        tiles: this._tilesWithMeta(),
        coveredMap: this._covered(),
        tray: nt,
        history: newHistory
      })
    }

    // 胜负判定
    setTimeout(() => {
      if (this.data.card) return
      if (this._tiles.length === 0 && this.data.tray.length === 0) {
        this.setData({ endTitle: '🎉 通关！', endText: '学到 ' + app.globalData.learned.length + ' 个词' })
      } else if (this.data.tray.length >= TRAY) {
        this.setData({ endTitle: '😅 槽位满了', endText: '试试洗牌或重开' })
      }
    }, 50)
  },

  closeCard() { this.setData({ card: null, combo: this.data.combo }) },

  speakUK() { if (this.data.card) tts.play(this.data.card.id, 'uk') },
  speakUS() { if (this.data.card) tts.play(this.data.card.id, 'us') },

  toolRemove() {
    if (!this.data.tray.length || this.data.tools.remove <= 0) return
    const mv = this.data.tray.slice(0, Math.min(3, this.data.tray.length))
    const remain = this.data.tray.slice(mv.length)
    this._tiles = this._tiles.concat(mv)
    this.setData({
      tray: remain,
      tiles: this._tilesWithMeta(),
      coveredMap: this._covered(),
      history: [], combo: 0,
      tools: { ...this.data.tools, remove: this.data.tools.remove - 1 }
    })
  },

  toolUndo() {
    if (!this.data.history.length || this.data.tools.undo <= 0) return
    const last = this.data.history[this.data.history.length - 1]
    const idx = this.data.tray.findIndex(x => x.id === last.id)
    if (idx < 0) return
    const nt = this.data.tray.slice()
    nt.splice(idx, 1)
    this._tiles = this._tiles.concat([last])
    this.setData({
      tray: nt,
      tiles: this._tilesWithMeta(),
      coveredMap: this._covered(),
      history: this.data.history.slice(0, -1),
      combo: 0,
      tools: { ...this.data.tools, undo: this.data.tools.undo - 1 }
    })
  },

  toolShuffle() {
    if (this.data.tools.shuffle <= 0) return
    const ids = this._tiles.map(t => t.wordId)
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }
    this._tiles = this._tiles.map((t, i) => ({ ...t, wordId: ids[i] }))
    this.setData({
      tiles: this._tilesWithMeta(),
      coveredMap: this._covered(),
      tools: { ...this.data.tools, shuffle: this.data.tools.shuffle - 1 }
    })
  },

  goHome() { wx.navigateBack() },
  restart() { this.newGame() }
})
