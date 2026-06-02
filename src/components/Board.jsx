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
                <span style={{ position: 'relative', zIndex: 1 }}>{w.emoji}</span>
              </div>
            )
          })}
      </div>
    </div>
  )
}
