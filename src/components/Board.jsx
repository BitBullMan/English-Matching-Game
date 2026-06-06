import React, { useEffect, useMemo, useRef, useState } from 'react'
import { WORD_MAP } from '../data/words.js'
import { isCovered, TILE_SIZE } from '../game/level.js'

export default function Board({ level, tiles, onTileTap }) {
  const wrapRef = useRef(null)
  const [scale, setScale] = useState(1)

  // 棋盘自适应：以"宽度足够"为准
  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current
      if (!el) return
      const aw = el.clientWidth
      const ah = el.clientHeight
      const sx = aw / level.width
      const sy = ah / level.height
      setScale(Math.min(sx, sy, 1))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [level])

  const coveredMap = useMemo(() => {
    const m = {}
    tiles.forEach(t => { m[t.id] = isCovered(t, tiles) })
    return m
  }, [tiles])

  return (
    <div className="board" ref={wrapRef}>
      <div
        className="board-inner"
        style={{
          width: level.width,
          height: level.height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {tiles
          .slice()
          .sort((a, b) => a.layer - b.layer)
          .map(tile => {
            const w = WORD_MAP[tile.wordId]
            if (!w) return null
            const covered = coveredMap[tile.id]
            return (
              <div
                key={tile.id}
                className={`tile ${covered ? 'covered' : 'active'}`}
                style={{
                  left: tile.x,
                  top: tile.y,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  transform: `rotate(${tile.rotate || 0}deg)`,
                  zIndex: 10 + tile.layer
                }}
                onClick={() => !covered && onTileTap(tile)}
              >
                {/* 显示优先级:
                    1. vocab (v_) 词且有图: 用真实照片（emoji 不够准确，照片更直观）
                    2. base 词: emoji 优先（apple→🍎 已严格匹配）
                    3. preferImage:true: 强制图
                    4. 都没有: 大字英文 */}
                {(() => {
                  const isVocab = w.id?.startsWith('v_')
                  const useImage = (w.preferImage || isVocab) && w.image
                  if (useImage) {
                    return <img src={w.image} alt={w.english} className="tile-image" draggable={false} />
                  }
                  if (w.emoji) {
                    return <span style={{ position: 'relative', zIndex: 1 }}>{w.emoji}</span>
                  }
                  if (w.image) {
                    return <img src={w.image} alt={w.english} className="tile-image" draggable={false} />
                  }
                  return (
                    <span
                      className="tile-text"
                      title={w.english}
                      style={{
                        fontSize: w.english.length <= 4 ? 16
                                : w.english.length <= 6 ? 14
                                : w.english.length <= 8 ? 12
                                : 10
                      }}
                    >{w.english}</span>
                  )
                })()}
              </div>
            )
          })}
      </div>
    </div>
  )
}
