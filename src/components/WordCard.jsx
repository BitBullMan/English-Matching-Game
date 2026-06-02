import React, { useEffect, useState } from 'react'
import { speak, isSpeechSupported } from '../utils/speech.js'
import { store } from '../utils/store.js'

export default function WordCard({ word, onClose }) {
  const [expanded, setExpanded] = useState(false)
  const [playing, setPlaying] = useState(null)
  const settings = store.getSettings()
  const learnMode = settings.learnMode || 'en'

  useEffect(() => {
    if (!word) return
    const t = setTimeout(() => {
      if (learnMode === 'zh') doSpeak('zh', word.chinese)
      else doSpeak('uk', word.english)
    }, 220)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  useEffect(() => { if (!word) setExpanded(false) }, [word])

  if (!word) return null

  function doSpeak(accent, text) {
    setPlaying(accent + ':' + (text || ''))
    speak(text || (accent === 'zh' ? word.chinese : word.english), accent, accent === 'uk' || accent === 'us' ? word.id : null)
    setTimeout(() => setPlaying(null), 1500)
  }

  const hasExpand = word.example_en || word.memo_en
  const isZhMode = learnMode === 'zh'

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div className="card-emoji">{word.emoji}</div>
          {isZhMode ? (
            <>
              <h2 className="card-en" style={{ fontSize: 38 }}>{word.chinese}</h2>
              {word.pinyin && <div className="card-pinyin">{word.pinyin}</div>}
              <div className="card-zh" style={{ fontSize: 14, opacity: 0.8 }}>{word.english}</div>
            </>
          ) : (
            <>
              <h2 className="card-en">{word.english}</h2>
              <div className="card-zh">{word.chinese}</div>
            </>
          )}
        </div>

        <div className="card-body">
          {isZhMode ? (
            <div className="ipa-row">
              <span className="ipa-flag flag-cn">中</span>
              <span className="ipa-text">{word.pinyin || word.chinese}</span>
              <button
                className={`speak-btn ${playing && playing.startsWith('zh:') ? 'playing' : ''}`}
                onClick={() => doSpeak('zh', word.chinese)}
                disabled={!isSpeechSupported()}
                aria-label="播放普通话"
              >🔊</button>
            </div>
          ) : (
            <>
              <div className="ipa-row">
                <span className="ipa-flag flag-uk">UK</span>
                <span className="ipa-text">{word.ipa_uk}</span>
                <button
                  className={`speak-btn ${playing && playing.startsWith('uk:') ? 'playing' : ''}`}
                  onClick={() => doSpeak('uk', word.english)}
                  disabled={!isSpeechSupported()}
                  aria-label="播放英音"
                >🔊</button>
              </div>
              <div className="ipa-row">
                <span className="ipa-flag flag-us">US</span>
                <span className="ipa-text">{word.ipa_us}</span>
                <button
                  className={`speak-btn ${playing && playing.startsWith('us:') ? 'playing' : ''}`}
                  onClick={() => doSpeak('us', word.english)}
                  disabled={!isSpeechSupported()}
                  aria-label="播放美音"
                >🔊</button>
              </div>
            </>
          )}

          {hasExpand && (
            <button className="expand-toggle" onClick={() => setExpanded(v => !v)}>
              {expanded ? '收起 ▲' : (isZhMode ? 'Tell me more · 深入了解 ▼' : '深入了解 · Tell me more ▼')}
            </button>
          )}

          {expanded && (
            <div className="expand-panel">
              {word.example_en && (
                <div className="bi-block example">
                  <div className="bi-title-row">
                    <div className="bi-title">💬 例句 · Example</div>
                    {/* 例句 🔊 — 英语模式播英文，中文模式播中文 */}
                    <button
                      className="bi-speak"
                      onClick={() => isZhMode
                        ? doSpeak('zh', word.example_zh)
                        : doSpeak(settings.defaultAccent || 'uk', word.example_en)}
                      aria-label="播放例句"
                    >🔊</button>
                  </div>
                  {isZhMode ? (
                    <>
                      <div className="bi-en">{word.example_zh}</div>
                      <div className="bi-zh">{word.example_en}</div>
                    </>
                  ) : (
                    <>
                      <div className="bi-en">{word.example_en}</div>
                      {word.example_zh && <div className="bi-zh">{word.example_zh}</div>}
                    </>
                  )}
                </div>
              )}
              {word.memo_en && (
                <div className="bi-block">
                  <div className="bi-title-row">
                    <div className="bi-title">💡 记住它 · Remember</div>
                    <button
                      className="bi-speak"
                      onClick={() => isZhMode
                        ? doSpeak('zh', word.memo_zh)
                        : doSpeak(settings.defaultAccent || 'uk', word.memo_en)}
                      aria-label="播放记忆点"
                    >🔊</button>
                  </div>
                  {isZhMode ? (
                    <>
                      <div className="bi-en">{word.memo_zh}</div>
                      <div className="bi-zh">{word.memo_en}</div>
                    </>
                  ) : (
                    <>
                      <div className="bi-en">{word.memo_en}</div>
                      {word.memo_zh && <div className="bi-zh">{word.memo_zh}</div>}
                    </>
                  )}
                </div>
              )}
              {word.tip_en && (
                <div className="bi-block">
                  <div className="bi-title-row">
                    <div className="bi-title">✏️ 贴士 · Tip</div>
                    <button
                      className="bi-speak"
                      onClick={() => isZhMode
                        ? doSpeak('zh', word.tip_zh)
                        : doSpeak(settings.defaultAccent || 'uk', word.tip_en)}
                      aria-label="播放贴士"
                    >🔊</button>
                  </div>
                  {isZhMode ? (
                    <>
                      <div className="bi-en">{word.tip_zh}</div>
                      <div className="bi-zh">{word.tip_en}</div>
                    </>
                  ) : (
                    <>
                      <div className="bi-en">{word.tip_en}</div>
                      {word.tip_zh && <div className="bi-zh">{word.tip_zh}</div>}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button className="card-close" onClick={onClose}>
          {isZhMode ? 'Continue · 继续' : '继续 Continue'}
        </button>
      </div>
    </div>
  )
}
