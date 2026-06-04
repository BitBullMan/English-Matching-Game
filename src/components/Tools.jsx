import React from 'react'
import { t } from '../utils/i18n.js'

// 卡通三色按钮：每个按钮独立颜色 + 不同动作 emoji + 摆动 idle 动画
const TOOLS = [
  { id: 'remove',  cls: 'tool-pink',   mascot: '🐼', action: '🚀', labelKey: 'toolRemove',  tilt: -4 },
  { id: 'undo',    cls: 'tool-blue',   mascot: '🐼', action: '⏪', labelKey: 'toolUndo',    tilt: 3 },
  { id: 'shuffle', cls: 'tool-purple', mascot: '🐼', action: '🔀', labelKey: 'toolShuffle', tilt: -3 }
]

export default function Tools({ onRemove, onUndo, onShuffle, disabledRemove, disabledUndo, counts }) {
  const handlers = { remove: onRemove, undo: onUndo, shuffle: onShuffle }
  const disabled = { remove: disabledRemove, undo: disabledUndo, shuffle: false }
  return (
    <div className="tools">
      {TOOLS.map(tool => (
        <button
          key={tool.id}
          className={`tool-btn ${tool.cls}`}
          onClick={handlers[tool.id]}
          disabled={disabled[tool.id]}
          style={{ transform: `rotate(${tool.tilt}deg)` }}
        >
          <span className="tool-mascot-wrap">
            <span className="tool-mascot">{tool.mascot}</span>
            <span className="tool-action">{tool.action}</span>
          </span>
          <span className="tool-label">{t(tool.labelKey)}</span>
          {counts?.[tool.id] != null && <span className="tool-badge">{counts[tool.id]}</span>}
        </button>
      ))}
    </div>
  )
}
