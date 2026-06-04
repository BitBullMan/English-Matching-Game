import React from 'react'
import { WORD_MAP } from '../data/words.js'

export const TRAY_SIZE = 7

// 跟 Board 一致的三级 fallback：emoji → image → 英文文字
function renderWordContent(w) {
  if (!w) return null
  if (w.emoji) {
    if ((w.preferImage || w.emoji === '❓') && w.image) {
      return <img src={w.image} alt={w.english} className="tile-image" draggable={false} />
    }
    return <span>{w.emoji}</span>
  }
  if (w.image) {
    return <img src={w.image} alt={w.english} className="tile-image" draggable={false} />
  }
  return (
    <span
      className="tile-text"
      style={{
        fontSize: w.english.length <= 4 ? 13
                : w.english.length <= 6 ? 11
                : w.english.length <= 8 ? 10
                : 9
      }}
    >
      {w.english}
    </span>
  )
}

export default function Tray({ slots, warn, freshId }) {
  const cells = []
  for (let i = 0; i < TRAY_SIZE; i++) {
    const t = slots[i]
    const w = t ? WORD_MAP[t.wordId] : null
    const isFresh = t && t.id === freshId
    cells.push(
      <div key={i} className={`slot ${w ? '' : 'empty'} ${isFresh ? 'fresh' : ''}`}>
        {renderWordContent(w)}
      </div>
    )
  }
  return (
    <div className="tray-wrap">
      <div className={`tray ${warn ? 'tray-warn' : ''}`}>{cells}</div>
    </div>
  )
}
