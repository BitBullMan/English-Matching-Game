import React, { useEffect, useState } from 'react'
import { speak, isSpeechSupported } from '../utils/speech.js'
import { store } from '../utils/store.js'
import { Volume2, MessageSquare, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

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
      if (isLearnEN) doSpeak('uk', word.english, 'word')
      else doSpeak('zh', word.chinese, 'word')
    }, 220)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  useEffect(() => { if (!word) setExpanded(false) }, [word])
  if (!word) return null

  function doSpeak(accent, text, kind) {
    // kind: 'word' | 'ex_en' | 'ex_zh' | 'memo_en' | 'memo_zh'
    // 给每种文本分配 stable cache ID，例句/memo 也走 mp3 cache（修 iOS 中文长句静默 bug）
    setPlaying(accent + ':' + (text || '').slice(0, 20))
    const cacheId =
      kind === 'word'    ? word.id :
      kind === 'ex_en'   ? `${word.id}_ex_en` :
      kind === 'ex_zh'   ? `${word.id}_ex_zh` :
      kind === 'memo_en' ? `${word.id}_memo_en` :
      kind === 'memo_zh' ? `${word.id}_memo_zh` : null
    speak(text, accent, cacheId)
    setTimeout(() => setPlaying(null), 1500)
  }

  const hasExpand = word.example_en || word.memo_en

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <div className={`card-header ${((word.preferImage || (word.id && word.id.startsWith('v_'))) && word.image) ? 'with-image' : 'no-image'}`}>
          {/* v2 显示规则：
              - vocab (v_) 词：抽象多，有图优先大图
              - base 具象词：emoji 优先（已严格匹配 emoji）
              - preferImage:true 强制图 */}
          {((word.preferImage || (word.id && word.id.startsWith('v_'))) && word.image) ? (
            <img className="card-image" src={word.image} alt={word.english} />
          ) : word.emoji ? (
            <div className="card-emoji">{word.emoji}</div>
          ) : word.image ? (
            <img className="card-image" src={word.image} alt={word.english} />
          ) : (
            <div className="card-text-fallback">{word.english}</div>
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
                  onClick={() => doSpeak('uk', word.english, 'word')}
                  disabled={!isSpeechSupported()}
                  aria-label="播放英音"
                ><Volume2 /></button>
              </div>
              <div className="ipa-row">
                <span className="ipa-flag flag-us">US</span>
                <span className="ipa-text">{word.ipa_us}</span>
                <button
                  className={`speak-btn ${playing && playing.startsWith('us:') ? 'playing' : ''}`}
                  onClick={() => doSpeak('us', word.english, 'word')}
                  disabled={!isSpeechSupported()}
                  aria-label="播放美音"
                ><Volume2 /></button>
              </div>
            </>
          ) : (
            // 学中文 — 显示拼音 + 普通话 🔊
            <div className="ipa-row">
              <span className="ipa-flag flag-cn">中</span>
              <span className="ipa-text">{word.pinyin || word.chinese}</span>
              <button
                className={`speak-btn ${playing && playing.startsWith('zh:') ? 'playing' : ''}`}
                onClick={() => doSpeak('zh', word.chinese, 'word')}
                disabled={!isSpeechSupported()}
                aria-label="播放普通话"
              ><Volume2 /></button>
            </div>
          )}

          {hasExpand && (
            <button className="expand-toggle" onClick={() => setExpanded(v => !v)}>
              {expanded
                ? <>收起 <ChevronUp size={16} /></>
                : <>{isLearnZH ? 'Tell me more · 深入了解' : '深入了解 · Tell me more'} <ChevronDown size={16} /></>}
            </button>
          )}

          {expanded && (
            <div className="expand-panel">
              {word.example_en && (
                <div className="bi-block example">
                  <div className="bi-title-row">
                    <div className="bi-title"><MessageSquare /> 例句 · Example</div>
                    <button
                      className="bi-speak"
                      onClick={() => isLearnEN
                        ? doSpeak('uk', word.example_en, 'ex_en')   /* uk alloy 英音，跟单词一致 */
                        : doSpeak('zh', word.example_zh, 'ex_zh')}
                      aria-label="播放例句"
                    ><Volume2 /></button>
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
                    <div className="bi-title"><Lightbulb /> 记住它 · Remember</div>
                    <button
                      className="bi-speak"
                      onClick={() => isLearnEN
                        ? doSpeak('uk', word.memo_en, 'memo_en')    /* uk alloy 跟例句一致 */
                        : doSpeak('zh', word.memo_zh, 'memo_zh')}
                      aria-label="播放记忆点"
                    ><Volume2 /></button>
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
