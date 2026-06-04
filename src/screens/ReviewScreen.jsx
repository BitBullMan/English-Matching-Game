import React, { useMemo, useState } from 'react'
import { ALL_VOCAB as WORDS, WORD_MAP, CATEGORIES } from '../data/words.js'
import WordCard from '../components/WordCard.jsx'
import { t } from '../utils/i18n.js'

export default function ReviewScreen({ onBack, learned, stats }) {
  const [cat, setCat] = useState('all')
  const [showWord, setShowWord] = useState(null)

  const list = useMemo(() => {
    const arr = WORDS.filter(w => cat === 'all' || w.category === cat)
    // 已学排前，按掌握度（次数）从高到低
    return arr.sort((a, b) => {
      const la = learned.has(a.id), lb = learned.has(b.id)
      if (la !== lb) return la ? -1 : 1
      return (stats[b.id]?.count || 0) - (stats[a.id]?.count || 0)
    })
  }, [cat, learned, stats])

  return (
    <div className="sub-screen">
      <div className="sub-top">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="sub-title">{t('reviewTitle')}</div>
        <div className="sub-subtitle">{learned.size} / {WORDS.length}</div>
      </div>

      <div className="cat-tabs">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`cat-tab ${cat === c.id ? 'on' : ''}`}
            onClick={() => setCat(c.id)}
          >{c.label}</button>
        ))}
      </div>

      <div className="word-list">
        {list.map(w => {
          const isLearned = learned.has(w.id)
          const count = stats[w.id]?.count || 0
          return (
            <button
              key={w.id}
              className={`word-row ${isLearned ? '' : 'locked'}`}
              onClick={() => isLearned && setShowWord(w)}
              disabled={!isLearned}
            >
              <span className="wr-emoji">{isLearned ? w.emoji : '❓'}</span>
              <div className="wr-text">
                <div className="wr-en">{isLearned ? w.english : '???'}</div>
                <div className="wr-zh">{isLearned ? w.chinese : t('reviewLocked')}</div>
              </div>
              {isLearned && (
                <div className="wr-stat">
                  {Array.from({ length: Math.min(3, count) }, (_, i) => '⭐').join('')}
                  {count > 3 && <span className="wr-x">×{count}</span>}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {showWord && <WordCard word={showWord} onClose={() => setShowWord(null)} />}
    </div>
  )
}
