import React from 'react'

// 草地小装饰（散点的小花/草，让背景更生动；不抢主角）
const DECOS = [
  { type: 'flower', x: 6,  y: 22, ch: '🌼' },
  { type: 'flower', x: 92, y: 18, ch: '🌷' },
  { type: 'flower', x: 4,  y: 70, ch: '🌸' },
  { type: 'flower', x: 90, y: 78, ch: '🌻' },
  { type: 'grass',  x: 18, y: 16, ch: 'ᗯ' },
  { type: 'grass',  x: 78, y: 25, ch: 'ᗯ' },
  { type: 'grass',  x: 12, y: 50, ch: 'ᗯ' },
  { type: 'grass',  x: 86, y: 56, ch: 'ᗯ' },
  { type: 'grass',  x: 30, y: 82, ch: 'ᗯ' },
  { type: 'grass',  x: 65, y: 88, ch: 'ᗯ' }
]

export default function Decorations() {
  return (
    <>
      {DECOS.map((d, i) => (
        <span
          key={i}
          className={d.type === 'flower' ? 'dot dot-flower' : 'dot dot-grass'}
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
        >{d.ch}</span>
      ))}
    </>
  )
}
