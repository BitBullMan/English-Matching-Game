import React from 'react'
import { t } from '../utils/i18n.js'

/**
 * Apple Fitness 风格三环统计 v2 — 更精致
 *
 * 外→内 三环：词汇 / 关卡 / 坚持
 */
export default function ActivityRings({
  learned = 0, vocabTotal = 1,
  stagesPassed = 0, stagesTotal = 1,
  streak = 0
}) {
  const size = 120
  const cx = size / 2, cy = size / 2
  const stroke = 11
  const gap = 3

  const r1 = (size - stroke) / 2
  const r2 = r1 - stroke - gap
  const r3 = r2 - stroke - gap

  // iOS Activity Rings 真实色 — 更鲜亮
  const rings = [
    {
      r: r1, value: learned, max: vocabTotal,
      color: '#FA2D48', trackOpacity: 0.18,
      label: t('ringWords'), display: `${learned}/${vocabTotal}`
    },
    {
      r: r2, value: stagesPassed, max: stagesTotal,
      color: '#A4F500', trackOpacity: 0.2,
      label: t('ringStages'), display: `${stagesPassed}/${stagesTotal}`
    },
    {
      r: r3, value: Math.min(streak, 7), max: 7,
      color: '#1FDDEC', trackOpacity: 0.2,
      label: t('ringStreak'), display: `${streak}${t('ringStreak') === 'Streak' ? 'd' : 'd'}`
    },
  ]

  return (
    <div className="activity-rings-wrap">
      <div className="rings-svg-wrap">
        <svg className="activity-rings" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            {rings.map((ring, i) => (
              <linearGradient key={i} id={`g${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ring.color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={ring.color} stopOpacity="1" />
              </linearGradient>
            ))}
          </defs>
          {rings.map((ring, i) => {
            const circ = 2 * Math.PI * ring.r
            const pct = Math.max(0, Math.min(1, ring.value / ring.max))
            const dash = circ * pct
            return (
              <g key={i} transform={`rotate(-90 ${cx} ${cy})`}>
                {/* 轨道 */}
                <circle cx={cx} cy={cy} r={ring.r} fill="none"
                  stroke={ring.color} strokeOpacity={ring.trackOpacity}
                  strokeWidth={stroke} strokeLinecap="round" />
                {/* 进度 */}
                {pct > 0 && (
                  <circle cx={cx} cy={cy} r={ring.r} fill="none"
                    stroke={`url(#g${i})`} strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="ring-legend">
        {rings.map((ring, i) => (
          <div key={i} className="ring-legend-row">
            <div className="ring-legend-head">
              <span className="ring-dot" style={{ background: ring.color, boxShadow: `0 0 8px ${ring.color}` }} />
              <span className="ring-label">{ring.label}</span>
            </div>
            <span className="ring-value" style={{ color: ring.color }}>{ring.display}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
