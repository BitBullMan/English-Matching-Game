import React, { useEffect, useState } from 'react'
import { speak, isSpeechSupported } from '../utils/speech.js'
import { store } from '../utils/store.js'

// 学习模式显示逻辑（反转后 — 让学习者看到自己的母语为主）：
//   学英语 (learnMode='en'): 中国人学英语 — 大显中文 + 拼音，下方小字英文 + 音标 + 🔊
//   学中文 (learnMode='zh'): 英语母语者学中文 — 大显英文，下方汉字 + 拼音 + 🔊
export default function WordCard({ word, onClose }) {
  const [expanded, setExpanded] = useState(false)
  const [playing, setPlaying] = useState(null)
  const settings = store.getSettings()
  const learnMode = settings.learnMode || 'en'
  const isLearnEN = learnMode === 'en'  // 学英语 (母语是中文)
  const isLearnZH = learnMode === 'zh'  // 学中文 (母语是英文)

  useEffect(() => {
    if (!word) return
    // 自动播放：学什么就发什么音
    const t = setTimeout(() => {
      if (isLearnEN) doSpeak('uk', word.english)
      else doSpeak('zh', word.chinese)
    }, 220)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  useEffect(() => { if (!word) setExpanded(false) }, [word])
  if (!word) return null

  function doSpeak(accent, text) {
    setPlaying(accent + ':' + (text || ''))
    // 只有播放单词/短语本身时才用预生成 mp3 cache
    // 例句 / memo / tip 这些动态文本必须走 TTS，不能用 mp3 cache（否则播错）
    const isWordItself = text === word.english || text === word.chinese
    speak(text, accent, isWordItself ? word.id : null)
    setTimeout(() => setPlaying(null), 1500)
  }

  const hasExpand = word.example_en || word.memo_en

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          {word.image ? (
            <img className="card-image" src={word.image} alt={word.english} />
          ) : (
            <div className="card-emoji">{word.emoji}</div>
          )}

          {isLearnEN ? (
            // 学英语：中文为主（母语熟悉）
            <>
              <h2 className="card-en" style={{ fontSize: 36 }}>{word.chinese}</h2>
              {word.pinyin && <div className="card-pinyin">{word.pinyin}</div>}
              <div className="card-zh" style={{ fontSize: 18, marginTop: 4 }}>{word.english}</div>
            </>
          ) : (
            // 学中文：英文为主（母语熟悉）
            <>
              <h2 className="card-en" style={{ fontSize: 36 }}>{word.english}</h2>
              <div className="card-zh" style={{ fontSize: 16 }}>{word.chinese}</div>
              {word.pinyin && <div className="card-pinyin" style={{ fontSize: 16, marginTop: 2 }}>{word.pinyin}</div>}
            </>
          )}
        </div>

        <div className="card-body">
          {isLearnEN ? (
            // 学英语 — 显示英文音标 + 英美 🔊
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
          ) : (
            // 学中文 — 显示拼音 + 普通话 🔊
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
          )}

          {hasExpand && (
            <button className="expand-toggle" onClick={() => setExpanded(v => !v)}>
              {expanded ? '收起 ▲' : (isLearnZH ? 'Tell me more · 深入了解 ▼' : '深入了解 · Tell me more ▼')}
            </button>
          )}

          {expanded && (
            <div className="expand-panel">
              {word.example_en && (
                <div className="bi-block example">
                  <div className="bi-title-row">
                    <div className="bi-title">💬 例句 · Example</div>
                    <button
                      className="bi-speak"
                      onClick={() => isLearnEN
                        ? doSpeak(settings.defaultAccent || 'uk', word.example_en)
                        : doSpeak('zh', word.example_zh)}
                      aria-label="播放例句"
                    >🔊</button>
                  </div>
                  {isLearnEN ? (
                    // 学英语：中文例句为主、英文译文辅
                    <>
                      <div className="bi-en">{word.example_zh}</div>
                      {word.example_pinyin && <div className="bi-pinyin">{word.example_pinyin}</div>}
                      <div className="bi-zh">{word.example_en}</div>
                    </>
                  ) : (
                    // 学中文：英文例句为主、中文+拼音辅
                    <>
                      <div className="bi-en">{word.example_en}</div>
                      {word.example_zh && <div className="bi-zh">{word.example_zh}</div>}
                      {word.example_pinyin && <div className="bi-pinyin">{word.example_pinyin}</div>}
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
                      onClick={() => isLearnEN
                        ? doSpeak(settings.defaultAccent || 'uk', word.memo_en)
                        : doSpeak('zh', word.memo_zh)}
                      aria-label="播放记忆点"
                    >🔊</button>
                  </div>
                  {isLearnEN ? (
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
            </div>
          )}
        </div>

        <button className="card-close" onClick={onClose}>
          {isLearnZH ? 'Continue · 继续' : '继续 Continue'}
        </button>
      </div>
    </div>
  )
}
