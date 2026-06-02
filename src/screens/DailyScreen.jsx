import React, { useState } from 'react'
import { store, todayKey } from '../utils/store.js'

const REWARDS = [
  { day: 1, type: '💰', n: 50 },
  { day: 2, type: '💰', n: 80 },
  { day: 3, type: '🔀', n: 1, label: '洗牌' },
  { day: 4, type: '💰', n: 120 },
  { day: 5, type: '↩️', n: 1, label: '撤回' },
  { day: 6, type: '💰', n: 200 },
  { day: 7, type: '🏆', n: 1, label: '大奖' }
]

export default function DailyScreen({ onBack, onClaim }) {
  const [info, setInfo] = useState(store.getCheckin())
  const today = todayKey()
  const claimedToday = info.last === today

  const handleClaim = () => {
    if (claimedToday) return
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const y = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`
    const newStreak = info.last === y ? (info.streak % 7) + 1 : 1
    const reward = REWARDS[newStreak - 1]
    const next = { last: today, streak: newStreak, claimedDays: [...info.claimedDays, today] }
    store.setCheckin(next)
    setInfo(next)
    onClaim && onClaim(reward)
  }

  return (
    <div className="sub-screen">
      <div className="sub-top">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="sub-title">每日签到</div>
        <div className="sub-subtitle">连续 {info.streak} 天</div>
      </div>

      <div className="daily-banner">
        <span className="db-emoji">🎁</span>
        <div className="db-text">
          <div className="db-title">坚持 7 天</div>
          <div className="db-sub">奖励翻倍 · 解锁专属称号</div>
        </div>
      </div>

      <div className="daily-grid">
        {REWARDS.map(r => {
          const got = info.streak >= r.day && info.last === today
          const isToday = info.streak === r.day - 1 || (info.streak === r.day && info.last === today)
          return (
            <div key={r.day} className={`daily-cell ${got ? 'got' : ''} ${isToday ? 'today' : ''}`}>
              <div className="dc-day">第 {r.day} 天</div>
              <div className="dc-emoji">{r.type}</div>
              <div className="dc-amount">{r.label ? r.label : `×${r.n}`}</div>
              {got && <div className="dc-check">✓</div>}
            </div>
          )
        })}
      </div>

      <button
        className={`daily-btn ${claimedToday ? 'done' : ''}`}
        onClick={handleClaim}
        disabled={claimedToday}
      >
        {claimedToday ? '今日已领 · 明天再来' : '领取今日奖励'}
      </button>
    </div>
  )
}
