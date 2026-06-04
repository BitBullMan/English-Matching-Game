import React from 'react'
import { t } from '../utils/i18n.js'

/**
 * Apple Watch 风格三环统计
 *
 * 三环（外到内）：
 *   - 红：词汇学习进度  learned / total
 *   - 绿：通关进度       stagesPassed / stagesTotal
 *   - 蓝：连续坚持       streak / 7 (周目标)
 *
 * props: { learned, vocabTotal, stagesPassed, stagesTotal, streak }
 */
export default function ActivityRings({
  learned = 0, vocabTotal = 1,
  stagesPassed = 0, stagesTotal = 1,
  streak = 0
}) {
  const size = 144
  const cx = size / 2
  const cy = size / 2
  const stroke = 14
  const gap = 4

  // 三环半径（外到内）
  const r1 = (size - stroke) / 2 - 0
  const r2 = r1 - stroke - gap
  const r3 = r2 - stroke - gap

  const rings = [
    { r: r1, value: learned,       max: vocabTotal,  color: '#FA114F', track: 'rgba(250,17,79,0.18)', label: t('ringWords'),  display: `${learned}/${vocabTotal}` },
    { r: r2, value: stagesPassed,  max: stagesTotal, color: '#92E82C', track: 'rgba(146,232,44,0.18)', label: t('ringStages'), display: `${stagesPassed}/${stagesTotal}` },
    { r: r3, value: Math.min(streak, 7), max: 7,     color: '#1EEAEF', track: 'rgba(30,234,239,0.18)', label: t('ringStreak'), display: `${streak} ${t('ringStreak') === 'Streak' ? 'd' : '天'}` },
  ]

  return (
    <div className="activity-rings-wrap">
      <svg className="activity-rings" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => {
          const circ = 2 * Math.PI * ring.r
          const pct = Math.max(0, Math.min(1, ring.value / ring.max))
          const dash = circ * pct
          return (
            <g key={i} transform={`rotate(-90 ${cx} ${cy})`}>
              {/* 轨道 */}
              <circle cx={cx} cy={cy} r={ring.r} fill="none"
                stroke={ring.track} strokeWidth={stroke} strokeLinecap="round" />
              {/* 进度 */}
              {pct > 0 && (
                <circle cx={cx} cy={cy} r={ring.r} fill="none"
                  stroke={ring.color} strokeWidth={stroke} strokeLinecap="round"
                  strokeDasharray={`${dash} ${circ - dash}`} />
              )}
            </g>
          )
        })}
      </svg>

      <div className="ring-legend">
        {rings.map((ring, i) => (
          <div key={i} className="ring-legend-row">
            <span className="ring-dot" style={{ background: ring.color }} />
            <span className="ring-label">{ring.label}</span>
            <span className="ring-value" style={{ color: ring.color }}>{ring.display}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
