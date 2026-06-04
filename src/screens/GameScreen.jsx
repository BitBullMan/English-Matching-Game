import React, { useCallback, useEffect, useRef, useState } from 'react'
import { WORDS, WORD_MAP, ALL_VOCAB } from '../data/words.js'
import { getStage, getLevelOpt } from '../data/stages.js'
import { generateLevel } from '../game/level.js'
import { store } from '../utils/store.js'
import Board from '../components/Board.jsx'
import Tray, { TRAY_SIZE } from '../components/Tray.jsx'
import Tools from '../components/Tools.jsx'
import WordCard from '../components/WordCard.jsx'
import Decorations from '../components/Decorations.jsx'
import Onboarding from '../components/Onboarding.jsx'
import { playDing, playTap } from '../utils/music.js'
import { t, tField } from '../utils/i18n.js'

const COMBO_WORDS = ['NICE!', 'COOL!', 'GREAT!', 'EXCELLENT!', 'AMAZING!', 'BRAVO!']
const COMBO_RESET_MS = 2500

function defaultLevelOpt() {
  return { wordCount: 7, triplesPerWord: 2, layers: 3, boardW: 340, boardH: 360 }
}

// 根据 stage 算出词池 + 难度
function pickStageLevel(stageId) {
  if (!stageId) return { pool: WORDS, opt: defaultLevelOpt() }
  const stage = getStage(stageId)
  if (!stage) return { pool: WORDS, opt: defaultLevelOpt() }
  let pool = stage.picker(ALL_VOCAB)
  if (pool.length < 3) pool = WORDS  // 兜底
  return { pool, opt: getLevelOpt(stage.difficulty), stage }
}

export default function GameScreen({
  onBack,
  stageId,
  coins, setCoins,
  learned, setLearned,
  bumpStat,
  sfxOn
}) {
  const [level, setLevel] = useState(() => {
    const { pool, opt } = pickStageLevel(stageId)
    return generateLevel(pool, opt)
  })
  const [tiles, setTiles] = useState(level.tiles)
  const [tray, setTray] = useState([])
  const [freshId, setFreshId] = useState(null)
  const [history, setHistory] = useState([])
  const [cardWord, setCardWord] = useState(null)
  const [showLose, setShowLose] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const [showQuit, setShowQuit] = useState(false)
  const [showOnboard, setShowOnboard] = useState(() => !localStorage.getItem('em:onboarded'))
  const [warn, setWarn] = useState(false)
  const [combo, setCombo] = useState({ count: 0, key: 0 })
  const comboTimer = useRef(null)
  const [pop, setPop] = useState(null)
  const [toolCount, setToolCount] = useState({ remove: 3, undo: 5, shuffle: 3 })

  const bumpCombo = () => {
    setCombo(c => ({ count: c.count + 1, key: Date.now() }))
    clearTimeout(comboTimer.current)
    comboTimer.current = setTimeout(() => setCombo({ count: 0, key: 0 }), COMBO_RESET_MS)
  }
  const resetCombo = () => {
    clearTimeout(comboTimer.current)
    setCombo({ count: 0, key: 0 })
  }

  const handleTileTap = useCallback((tile) => {
    if (cardWord) return
    if (tray.length >= TRAY_SIZE) return

    if (sfxOn) playTap()

    const newTray = [...tray]
    let insertAt = newTray.length
    for (let i = newTray.length - 1; i >= 0; i--) {
      if (newTray[i].wordId === tile.wordId) { insertAt = i + 1; break }
    }
    newTray.splice(insertAt, 0, tile)

    setTiles(prev => prev.filter(t => t.id !== tile.id))
    setHistory(prev => [...prev, tile])
    setFreshId(tile.id)

    const counts = {}
    newTray.forEach(t => { counts[t.wordId] = (counts[t.wordId] || 0) + 1 })
    const matched = Object.keys(counts).find(k => counts[k] >= 3)

    if (matched) {
      const afterClear = newTray.filter(t => t.wordId !== matched)
      setTray(afterClear)
      setCoins(coins + 30)
      const nextLearned = new Set(learned); nextLearned.add(matched)
      setLearned(nextLearned)
      bumpStat(matched)
      bumpCombo()
      if (sfxOn) playDing()
      const text = COMBO_WORDS[Math.floor(Math.random() * COMBO_WORDS.length)]
      setPop({ text, key: Date.now() })
      setTimeout(() => setPop(null), 900)
      setTimeout(() => setCardWord(WORD_MAP[matched]), 360)
      setHistory([])
    } else {
      setTray(newTray)
      if (newTray.length >= TRAY_SIZE - 1) {
        setWarn(true); setTimeout(() => setWarn(false), 400)
      }
    }
  }, [tray, cardWord, coins, learned, sfxOn, bumpStat, setCoins, setLearned])

  useEffect(() => {
    if (cardWord) return
    if (tiles.length === 0 && tray.length === 0) {
      // 通关 → 标记关卡进度
      if (stageId) store.markStagePassed(stageId)
      setTimeout(() => setShowWin(true), 300)
    } else if (tray.length >= TRAY_SIZE) {
      setShowLose(true)
    }
  }, [tiles, tray, cardWord, stageId])

  const handleUndo = () => {
    if (history.length === 0 || toolCount.undo <= 0) return
    const last = history[history.length - 1]
    const idx = tray.findIndex(t => t.id === last.id)
    if (idx === -1) return
    const nt = [...tray]; nt.splice(idx, 1)
    setTray(nt)
    setTiles(prev => [...prev, last])
    setHistory(prev => prev.slice(0, -1))
    setToolCount(c => ({ ...c, undo: c.undo - 1 }))
    resetCombo()
  }

  const handleRemove = () => {
    if (tray.length === 0 || toolCount.remove <= 0) return
    const mv = tray.slice(0, Math.min(3, tray.length))
    const remain = tray.slice(mv.length)
    setTray(remain)
    setTiles(prev => [...prev, ...mv])
    setHistory([])
    setToolCount(c => ({ ...c, remove: c.remove - 1 }))
    resetCombo()
  }

  const handleShuffle = () => {
    if (toolCount.shuffle <= 0) return
    const ids = tiles.map(t => t.wordId)
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }
    setTiles(prev => prev.map((t, i) => ({ ...t, wordId: ids[i] })))
    setToolCount(c => ({ ...c, shuffle: c.shuffle - 1 }))
  }

  const restart = () => {
    const { pool, opt } = pickStageLevel(stageId)
    const lv = generateLevel(pool, opt)
    setLevel(lv); setTiles(lv.tiles); setTray([]); setHistory([])
    setShowLose(false); setShowWin(false); setCardWord(null)
    setToolCount({ remove: 3, undo: 5, shuffle: 3 })
    resetCombo()
  }

  return (
    <div className="game-screen">
      <Decorations />

      <div className="topbar">
        <button
          className="pause-btn"
          onClick={() => {
            // 如果有牌已抽出 or 进度过半，要确认；否则直接返回
            if (tray.length > 0 || tiles.length < level.tiles.length) setShowQuit(true)
            else onBack()
          }}
          title={t('back')}
        >‹</button>
        <div className="coin-pill">
          <span className="coin-emoji">💰</span>
          <span>{coins}</span>
        </div>
        <div className="spacer" />
        <button className="pause-btn" onClick={restart} title="重开" style={{ background: '#57b6ff', color: '#fff' }}>⟳</button>
      </div>

      <div className="rank-bubble">
        <span className="badge">{t('learnedShort', learned.size)}</span>
        <span className="row">
          {(() => {
            const stage = getStage(stageId)
            return stage ? `${stage.emoji} ${tField(stage, 'title')}` : t('stageLabel', '1-1')
          })()}
        </span>
      </div>

      {combo.count >= 2 && (
        <div key={combo.key} className="combo-side">
          {t('combo')}<span className="x">×</span><span className="n">{combo.count}</span>
        </div>
      )}

      <Board level={level} tiles={tiles} onTileTap={handleTileTap} />

      <Tray slots={tray} warn={warn} freshId={freshId} />

      <Tools
        onRemove={handleRemove}
        onUndo={handleUndo}
        onShuffle={handleShuffle}
        disabledRemove={tray.length === 0 || toolCount.remove <= 0}
        disabledUndo={history.length === 0 || toolCount.undo <= 0}
        counts={toolCount}
      />

      {pop && (
        <div className="combo-pop" key={pop.key}>
          {pop.text}
          <span className="plus">+30 💰</span>
        </div>
      )}

      {cardWord && <WordCard word={cardWord} onClose={() => setCardWord(null)} />}

      {showWin && (
        <div className="overlay">
          <div className="modal">
            <h2>{t('winTitle')}</h2>
            <p>{t('winSub', learned.size, coins)}</p>
            <button className="primary" onClick={restart}>{t('winBtn')}</button>
          </div>
        </div>
      )}

      {showLose && (
        <div className="overlay">
          <div className="modal">
            <h2>{t('loseTitle')}</h2>
            <p>{t('loseSub')}</p>
            <button className="primary" onClick={restart}>{t('loseBtn')}</button>
          </div>
        </div>
      )}

      {showOnboard && (
        <Onboarding onDone={() => {
          localStorage.setItem('em:onboarded', '1')
          setShowOnboard(false)
        }} />
      )}

      {showQuit && (
        <div className="overlay" onClick={() => setShowQuit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{t('quitTitle')}</h2>
            <p>{t('quitSub')}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                className="primary"
                style={{ flex: 1, background: '#e5e5e5', color: '#333', borderBottomColor: '#ccc' }}
                onClick={() => setShowQuit(false)}
              >{t('quitCancel')}</button>
              <button
                className="primary"
                style={{ flex: 1, background: '#FF4B4B', borderBottomColor: '#c33333' }}
                onClick={onBack}
              >{t('quitConfirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
