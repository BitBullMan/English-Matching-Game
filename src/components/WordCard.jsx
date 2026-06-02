import React, { useEffect, useState } from 'react'
import { speak, isSpeechSupported } from '../utils/speech.js'
import { store } from '../utils/store.js'

export default function WordCard({ word, onClose }) {
  const [expanded, setExpanded] = useState(false)
  const [playing, setPlaying] = useState(null)
  const settings = store.getSettings()
  const learnMode = settings.learnMode || 'en'

  // 自动播：英语模式播英文（首选英音），中文模式播普通话
  useEffect(() => {
    if (!word) return
    const t = setTimeout(() => {
      if (learnMode === 'zh') doSpeak('zh')
      else doSpeak('uk')
    }, 220)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  useEffect(() => { if (!word) setExpanded(false) }, [word])

  if (!word) return null

  function doSpeak(accent) {
    setPlaying(accent)
    const text = accent === 'zh' ? word.chinese : word.english
    speak(text, accent, word.id)
    setTimeout(() => setPlaying(null), 1200)
  }

  const hasExpand = word.example_en || word.memo_en
  const isZhMode = learnMode === 'zh'

  // 弹卡顶部主显示：跟着模式切换
  //   en 模式 → 大显英文 + 中文辅
  //   zh 模式 → 大显中文 + 拼音辅 + 英文备注
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
            // 中文学习模式：只显示一行普通话朗读
            <div className="ipa-row">
              <span className="ipa-flag flag-cn">中</span>
              <span className="ipa-text">{word.pinyin || word.chinese}</span>
              <button
                className={`speak-btn ${playing === 'zh' ? 'playing' : ''}`}
                onClick={() => doSpeak('zh')}
                disabled={!isSpeechSupported()}
                aria-label="播放普通话"
              >🔊</button>
            </div>
          ) : (
            // 英语学习模式：UK + US 两行
            <>
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
            </>
          )}

          {hasExpand && (
            <button className="expand-toggle" onClick={() => setExpanded(v => !v)}>
              {expanded ? (isZhMode ? '收起 ▲' : '收起 ▲') : (isZhMode ? 'Tell me more · 深入了解 ▼' : '深入了解 · Tell me more ▼')}
            </button>
          )}

          {expanded && (
            <div className="expand-panel">
              {word.example_en && (
                <div className="bi-block example">
                  <div className="bi-title">💬 例句 · Example</div>
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
                  <div className="bi-title">💡 记住它 · Remember</div>
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
                  <div className="bi-title">✏️ 贴士 · Tip</div>
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
