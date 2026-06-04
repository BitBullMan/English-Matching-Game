import React from 'react'
import { t } from '../utils/i18n.js'

// Mock 排行榜 — 等真有后端再接
const MOCK = [
  { rank: 1, name: 'Lily 🇬🇧', words: 312, you: false },
  { rank: 2, name: 'Mike 🇺🇸', words: 287, you: false },
  { rank: 3, name: 'Sora 🇯🇵', words: 245, you: false },
  { rank: 4, name: 'Anna 🇩🇪', words: 198, you: false },
  { rank: 5, name: 'Kim 🇰🇷',  words: 176, you: false }
]

export default function RankingScreen({ onBack, learned }) {
  // 把"你"插到正确名次
  const myCount = learned.size
  const all = MOCK.map(x => ({ ...x }))
  let inserted = false
  for (let i = 0; i < all.length; i++) {
    if (myCount > all[i].words) {
      all.splice(i, 0, { rank: 0, name: t('rankingYou'), words: myCount, you: true })
      inserted = true
      break
    }
  }
  if (!inserted) all.push({ rank: 0, name: t('rankingYou'), words: myCount, you: true })
  all.forEach((x, i) => x.rank = i + 1)

  return (
    <div className="sub-screen">
      <div className="sub-top">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="sub-title">{t('rankingTitle')}</div>
        <div className="sub-subtitle">{t('rankingSubtitle')}</div>
      </div>

      <div className="rank-list">
        {all.map(r => (
          <div key={r.rank + r.name} className={`rank-row ${r.you ? 'me' : ''}`}>
            <div className={`rank-no rank-${Math.min(r.rank, 4)}`}>
              {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
            </div>
            <div className="rank-name">{r.name}</div>
            <div className="rank-words">{t('wordCount', r.words)}</div>
          </div>
        ))}
      </div>

      <div className="rank-note">
        {t('rankingNote')}
      </div>
    </div>
  )
}
