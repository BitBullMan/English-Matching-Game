// 关卡生成（小程序版）— 与 src/game/level.js 同算法，CommonJS 输出

const TILE = 88        // rpx
const PAD = 8

function shuffle(a) {
  a = a.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateLevel(wordPool, opt) {
  opt = opt || {}
  const wordCount = opt.wordCount || 6
  const triples = opt.triplesPerWord || 2
  const layers = opt.layers || 3
  const boardW = opt.boardW || 560
  const boardH = opt.boardH || 600

  const pick = shuffle(wordPool).slice(0, wordCount)
  const all = []
  pick.forEach(w => {
    for (let i = 0; i < 3 * triples; i++) all.push({ wordId: w.id })
  })
  const sh = shuffle(all)
  const placed = []

  for (let i = 0; i < sh.length; i++) {
    const lyr = i % layers
    let best = null, bestS = Infinity
    for (let att = 0; att < 14; att++) {
      const x = Math.random() * (boardW - TILE)
      const y = Math.random() * (boardH - TILE)
      let s = 0
      for (const p of placed) {
        if (p.layer !== lyr) continue
        const dx = (p.x + TILE/2) - (x + TILE/2)
        const dy = (p.y + TILE/2) - (y + TILE/2)
        const d2 = dx*dx + dy*dy
        const mn = (TILE + PAD) * (TILE + PAD)
        if (d2 < mn) s += (mn - d2)
      }
      if (s < bestS) { best = { x, y }; bestS = s; if (s === 0) break }
    }
    placed.push({
      id: 't-' + i,
      wordId: sh[i].wordId,
      layer: lyr,
      x: best.x,
      y: best.y,
      rot: (Math.random() * 2 - 1) * 10
    })
  }
  return { tiles: placed, width: boardW, height: boardH }
}

function isCovered(tile, all) {
  const cx = tile.x + TILE / 2
  const cy = tile.y + TILE / 2
  return all.some(t => {
    if (t.layer <= tile.layer || t.id === tile.id) return false
    return cx >= t.x && cx <= t.x + TILE && cy >= t.y && cy <= t.y + TILE
  })
}

module.exports = { generateLevel, isCovered, TILE_SIZE: TILE }
