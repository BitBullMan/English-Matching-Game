import React, { useMemo } from 'react'
import { ALL_VOCAB } from '../data/words.js'
import { STAGES, STAGE_GROUPS, DIFFICULTY_LABELS } from '../data/stages.js'
import { store } from '../utils/store.js'
import { t, tField } from '../utils/i18n.js'

// 关卡选择页 — 按主题组展示，已通关 ✓
export default function StagesScreen({ onBack, onPickStage }) {
  const progress = store.getStageProgress()

  // 每个关卡计算"可用词数"，少于 3 词的关卡隐藏
  const validStages = useMemo(
    () => STAGES.map(s => ({ ...s, available: s.picker(ALL_VOCAB).length }))
                .filter(s => s.available >= 3),
    []
  )

  // 按 group 分组
  const grouped = useMemo(() => {
    const m = {}
    for (const s of validStages) {
      if (!m[s.group]) m[s.group] = []
      m[s.group].push(s)
    }
    return m
  }, [validStages])

  return (
    <div className="sub-screen stages">
      <div className="sub-top">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="sub-title">{t('stagesTitle')}</div>
        <div className="sub-subtitle">{Object.keys(progress).length}/{validStages.length}</div>
      </div>

      <div className="stages-body">
        {STAGE_GROUPS.map(g => {
          const list = grouped[g.id]
          if (!list || !list.length) return null
          return (
            <div key={g.id} className="stage-group">
              <div className="stage-group-title" style={{ color: g.color }}>{tField(g, 'label')}</div>
              <div className="stage-grid">
                {list.map(s => {
                  const passed = progress[s.id]?.passed || 0
                  return (
                    <button
                      key={s.id}
                      className={`stage-card ${passed ? 'passed' : ''}`}
                      onClick={() => onPickStage(s.id)}
                      style={{ '--stage-color': g.color }}
                    >
                      <div className="stage-emoji">{s.emoji}</div>
                      <div className="stage-title">{tField(s, 'title')}</div>
                      <div className="stage-intro">{tField(s, 'intro')}</div>
                      <div className="stage-meta">
                        <span className="stage-diff">{DIFFICULTY_LABELS[s.difficulty].stars}</span>
                        <span className="stage-count">{t('wordCount', s.available)}</span>
                      </div>
                      {passed > 0 && <div className="stage-check">✓ {passed}</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
