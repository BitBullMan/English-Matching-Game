import React from 'react'
import { WORDS } from '../data/words.js'
import { t } from '../utils/i18n.js'

export default function HomeScreen({ onGo, coins, learned, streak }) {
  const SIDE_ENTRIES = [
    { id: 'review',   icon: '📚', label: t('wordbook') },
    { id: 'daily',    icon: '📅', label: t('daily') },
    { id: 'ranking',  icon: '🏆', label: t('ranking') },
    { id: 'settings', icon: '⚙️', label: t('settings') },
    { id: 'about',    icon: 'ℹ️', label: t('about') }
  ]

  return (
    <div className="home">
      {/* 顶部条 */}
      <div className="home-top">
        <div className="coin-pill">
          <span className="coin-emoji">💰</span>
          <span>{coins}</span>
        </div>
        <div className="streak-pill">{t('streak', streak)}</div>
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
        <div className="title-en">{t('appTitleSub')}</div>
        <div className="title-zh">{t('appTitleMain')}</div>
        <div className="mascot">🐼</div>
        <div className="mascot-shadow" />
        <div className="speech-bubble">{t('bubble')}</div>
      </div>

      {/* 底部 CTA */}
      <div className="home-bottom">
        <div className="stat-strip">
          <div className="stat">
            <div className="stat-n">{learned}</div>
            <div className="stat-l">{t('learned')}</div>
          </div>
          <div className="stat">
            <div className="stat-n">{WORDS.length}</div>
            <div className="stat-l">{t('vocabSize')}</div>
          </div>
          <div className="stat">
            <div className="stat-n">{Math.round(learned / WORDS.length * 100)}%</div>
            <div className="stat-l">{t('completed')}</div>
          </div>
        </div>

        <button className="play-btn" onClick={() => onGo('stages')}>
          <span style={{ fontSize: 22 }}>▶</span>
          {t('playBtn')}
        </button>

        <div className="bottom-grid">
          <button className="grid-btn" onClick={() => onGo('review')}>
            <span className="grid-icon">📚</span>
            <span>{t('reviewBtn')}</span>
          </button>
          <button className="grid-btn" onClick={() => onGo('daily')}>
            <span className="grid-icon">🎁</span>
            <span>{t('rewardBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
