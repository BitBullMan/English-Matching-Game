import React, { useEffect, useState } from 'react'
import { speak, isSpeechSupported } from '../utils/speech.js'

export default function WordCard({ word, onClose }) {
  const [expanded, setExpanded] = useState(false)
  const [playing, setPlaying] = useState(null)

  useEffect(() => {
    if (!word) return
    const t = setTimeout(() => doSpeak('uk'), 220)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  useEffect(() => { if (!word) setExpanded(false) }, [word])

  if (!word) return null

  function doSpeak(accent) {
    setPlaying(accent)
    speak(word.english, accent, word.id)
    setTimeout(() => setPlaying(null), 1200)
  }

  const hasExpand = word.example_en || word.memo_en

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div className="card-emoji">{word.emoji}</div>
          <h2 className="card-en">{word.english}</h2>
          <div className="card-zh">{word.chinese}</div>
        </div>

        <div className="card-body">
          <div className="ipa-row">
            <span className="ipa-flag flag-uk">UK</span>
            <span className="ipa-text">{word.ipa_uk}</span>
            <button
              className={`speak-btn ${playing === 'uk' ? 'playing' : ''}`}
              onClick={() => doSpeak('uk')}
              disabled={!isSpeechSupported()}
              aria-label="播放英音"
            >🔊</button>
          </div>
          <div className="ipa-row">
            <span className="ipa-flag flag-us">US</span>
            <span className="ipa-text">{word.ipa_us}</span>
            <button
              className={`speak-btn ${playing === 'us' ? 'playing' : ''}`}
              onClick={() => doSpeak('us')}
              disabled={!isSpeechSupported()}
              aria-label="播放美音"
            >🔊</button>
          </div>

          {hasExpand && (
            <button className="expand-toggle" onClick={() => setExpanded(v => !v)}>
              {expanded ? '收起 ▲' : '深入了解 · Tell me more ▼'}
            </button>
          )}

          {expanded && (
            <div className="expand-panel">
              {word.example_en && (
                <div className="bi-block example">
                  <div className="bi-title">💬 例句 · Example</div>
                  <div className="bi-en">{word.example_en}</div>
                  {word.example_zh && <div className="bi-zh">{word.example_zh}</div>}
                </div>
              )}
              {word.memo_en && (
                <div className="bi-block">
                  <div className="bi-title">💡 记住它 · Remember</div>
                  <div className="bi-en">{word.memo_en}</div>
                  {word.memo_zh && <div className="bi-zh">{word.memo_zh}</div>}
                </div>
              )}
              {word.tip_en && (
                <div className="bi-block">
                  <div className="bi-title">✏️ 贴士 · Tip</div>
                  <div className="bi-en">{word.tip_en}</div>
                  {word.tip_zh && <div className="bi-zh">{word.tip_zh}</div>}
                </div>
              )}
            </div>
          )}
        </div>

        <button className="card-close" onClick={onClose}>继续 Continue</button>
      </div>
    </div>
  )
}
