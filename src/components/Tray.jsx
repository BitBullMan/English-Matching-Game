import React from 'react'
import { WORD_MAP } from '../data/words.js'

export const TRAY_SIZE = 7

export default function Tray({ slots, warn, freshId }) {
  const cells = []
  for (let i = 0; i < TRAY_SIZE; i++) {
    const t = slots[i]
    const w = t ? WORD_MAP[t.wordId] : null
    const isFresh = t && t.id === freshId
    cells.push(
      <div key={i} className={`slot ${w ? '' : 'empty'} ${isFresh ? 'fresh' : ''}`}>
        {w ? <span>{w.emoji}</span> : null}
      </div>
    )
  }
  return (
    <div className="tray-wrap">
      <div className={`tray ${warn ? 'tray-warn' : ''}`}>{cells}</div>
    </div>
  )
}
