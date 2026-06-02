import React from 'react'
import { WORDS } from '../data/words.js'

// 侧栏快捷入口（参考"猪坚强"主页结构）
const SIDE_ENTRIES = [
  { id: 'review',   icon: '📚', label: '单词本' },
  { id: 'daily',    icon: '📅', label: '每日签到' },
  { id: 'ranking',  icon: '🏆', label: '排行榜' },
  { id: 'settings', icon: '⚙️', label: '设置' },
  { id: 'about',    icon: 'ℹ️', label: '关于' }
]

export default function HomeScreen({ onGo, coins, learned, streak }) {
  return (
    <div className="home">
      {/* 顶部条 */}
      <div className="home-top">
        <div className="coin-pill">
          <span className="coin-emoji">💰</span>
          <span>{coins}</span>
        </div>
        <div className="streak-pill">
          🔥 连续 {streak} 天
        </div>
      </div>

      {/* 侧栏入口 */}
      <div className="side-rail">
        {SIDE_ENTRIES.map(e => (
          <button key={e.id} className="rail-btn" onClick={() => onGo(e.id)}>
            <span className="rail-icon">{e.icon}</span>
            <span className="rail-label">{e.label}</span>
          </button>
        ))}
      </div>

      {/* 主舞台 */}
      <div className="stage">
        <div className="title-en">English Match</div>
        <div className="title-zh">消消学英语</div>
        <div className="mascot">🐼</div>
        <div className="mascot-shadow" />
        <div className="speech-bubble">🎋 一起学新词吧！</div>
      </div>

      {/* 底部 CTA */}
      <div className="home-bottom">
        <div className="stat-strip">
          <div className="stat">
            <div className="stat-n">{learned}</div>
            <div className="stat-l">已学</div>
          </div>
          <div className="stat">
            <div className="stat-n">{WORDS.length}</div>
            <div className="stat-l">词库</div>
          </div>
          <div className="stat">
            <div className="stat-n">{Math.round(learned / WORDS.length * 100)}%</div>
            <div className="stat-l">完成</div>
          </div>
        </div>

        <button className="play-btn" onClick={() => onGo('game')}>
          <span style={{ fontSize: 22 }}>▶</span>
          开始游戏
        </button>

        <div className="bottom-grid">
          <button className="grid-btn" onClick={() => onGo('review')}>
            <span className="grid-icon">📚</span>
            <span>复习单词</span>
          </button>
          <button className="grid-btn" onClick={() => onGo('daily')}>
            <span className="grid-icon">🎁</span>
            <span>领取奖励</span>
          </button>
        </div>
      </div>
    </div>
  )
}
