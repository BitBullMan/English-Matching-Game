// 关卡生成器
// 散落式（仿"猪坚强"）：在一个矩形区域里随机抛撒卡片，允许轻微重叠和旋转；
// 仍保留多层（layer）概念，让上层覆盖下层 → 玩起来有先消除浅层再露出深层的乐趣。
//
// 坐标单位：px（直接是棋盘内的绝对位置）
// 卡片尺寸：TILE x TILE
// 棋盘大小由调用方传入 boardW / boardH（外部容器会做自适应）

const TILE = 56            // 单张牌大小（需与 CSS 同步）
const PAD = 6              // 牌之间的最小水平/垂直间距（散落感）
const ROT_RANGE = 14       // 随机旋转角度上限 ±° （0 表示不旋转）

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function rand(min, max) { return min + Math.random() * (max - min) }

/**
 * @param {Array} wordPool
 * @param {Object} opt
 *   wordCount       多少种词
 *   triplesPerWord  每词几组 (×3 张)
 *   layers          层数
 *   boardW / boardH 棋盘尺寸 (px)
 */
export function generateLevel(wordPool, opt = {}) {
  const {
    wordCount = 7,
    triplesPerWord = 2,
    layers = 3,
    boardW = 340,
    boardH = 360
  } = opt

  // 选词 → 构造所有牌
  const picked = shuffle(wordPool).slice(0, wordCount)
  const all = []
  picked.forEach(w => {
    for (let i = 0; i < 3 * triplesPerWord; i++) {
      all.push({ wordId: w.id })
    }
  })
  const sh = shuffle(all)

  // 分层
  const layerOf = []
  for (let i = 0; i < sh.length; i++) layerOf.push(i % layers)

  // 每层在 boardW × boardH 范围内做"间隔散落"
  const placed = []
  const slotMaxX = boardW - TILE
  const slotMaxY = boardH - TILE

  // 用一个简单的"最少冲突"放置：每张牌尝试 N 次找一个跟同层牌不严重重叠的位置
  for (let i = 0; i < sh.length; i++) {
    const lyr = layerOf[i]
    const tile = sh[i]

    let best = null
    let bestScore = Infinity
    for (let attempt = 0; attempt < 16; attempt++) {
      const x = rand(0, slotMaxX)
      const y = rand(0, slotMaxY)
      // 与同层已放置的距离评分（越小越好，希望略大一点的间距）
      let score = 0
      for (const p of placed) {
        if (p.layer !== lyr) continue
        const dx = (p.x + TILE/2) - (x + TILE/2)
        const dy = (p.y + TILE/2) - (y + TILE/2)
        const d2 = dx*dx + dy*dy
        const minOK = (TILE + PAD) * (TILE + PAD)
        if (d2 < minOK) score += (minOK - d2)
      }
      if (score < bestScore) {
        best = { x, y }
        bestScore = score
        if (score === 0) break
      }
    }
    placed.push({
      id: `t-${i}`,
      wordId: tile.wordId,
      layer: lyr,
      x: best.x,
      y: best.y,
      rotate: (Math.random() * 2 - 1) * ROT_RANGE
    })
  }

  return {
    tiles: placed,
    width: boardW,
    height: boardH,
    wordIds: picked.map(w => w.id)
  }
}

/**
 * 判断 tile 是否被上层任意 tile 遮挡（中心点落在某个上层牌矩形内即算）
 */
export function isCovered(tile, allTiles) {
  const cx = tile.x + TILE / 2
  const cy = tile.y + TILE / 2
  return allTiles.some(t => {
    if (t.layer <= tile.layer) return false
    if (t.id === tile.id) return false
    return cx >= t.x && cx <= t.x + TILE && cy >= t.y && cy <= t.y + TILE
  })
}

export const TILE_SIZE = TILE
