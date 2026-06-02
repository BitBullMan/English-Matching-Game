import React from 'react'

// 卡通三色按钮：每个按钮独立颜色 + 不同动作 emoji + 摆动 idle 动画
const TOOLS = [
  {
    id: 'remove',  cls: 'tool-pink',
    mascot: '🐼', action: '🚀',
    label: '移出',
    tilt: -4
  },
  {
    id: 'undo',    cls: 'tool-blue',
    mascot: '🐼', action: '⏪',
    label: '撤回',
    tilt: 3
  },
  {
    id: 'shuffle', cls: 'tool-purple',
    mascot: '🐼', action: '🔀',
    label: '洗牌',
    tilt: -3
  }
]

export default function Tools({ onRemove, onUndo, onShuffle, disabledRemove, disabledUndo, counts }) {
  const handlers = { remove: onRemove, undo: onUndo, shuffle: onShuffle }
  const disabled = { remove: disabledRemove, undo: disabledUndo, shuffle: false }
  return (
    <div className="tools">
      {TOOLS.map(t => (
        <button
          key={t.id}
          className={`tool-btn ${t.cls}`}
          onClick={handlers[t.id]}
          disabled={disabled[t.id]}
          style={{ transform: `rotate(${t.tilt}deg)` }}
        >
          <span className="tool-mascot-wrap">
            <span className="tool-mascot">{t.mascot}</span>
            <span className="tool-action">{t.action}</span>
          </span>
          <span className="tool-label">{t.label}</span>
          {counts?.[t.id] != null && <span className="tool-badge">{counts[t.id]}</span>}
        </button>
      ))}
    </div>
  )
}
