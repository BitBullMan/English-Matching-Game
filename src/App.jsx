import React, { useEffect, useState } from 'react'
import HomeScreen from './screens/HomeScreen.jsx'
import GameScreen from './screens/GameScreen.jsx'
import ReviewScreen from './screens/ReviewScreen.jsx'
import DailyScreen from './screens/DailyScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import RankingScreen from './screens/RankingScreen.jsx'
import AboutScreen from './screens/AboutScreen.jsx'
import { store } from './utils/store.js'
import { startMusic, stopMusic } from './utils/music.js'
import { hideSplash, setStatusBar, onBackButton, onAppStateChange } from './utils/native.js'
import MusicToggle from './components/MusicToggle.jsx'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [coins, setCoinsRaw] = useState(() => store.getCoins())
  const [learned, setLearnedRaw] = useState(() => store.getLearned())
  const [stats, setStats] = useState(() => store.getStats())
  const [settings, setSettings] = useState(() => store.getSettings())
  const [claimToast, setClaimToast] = useState(null)

  // 持久化 wrapper
  const setCoins = v => { setCoinsRaw(v); store.setCoins(v) }
  const setLearned = s => { setLearnedRaw(s); store.setLearned(s) }
  const bumpStat = wordId => setStats(store.bumpStat(wordId))

  // 背景音乐：跟随设置 + 切换曲风时重新启动
  useEffect(() => {
    if (settings.music) startMusic(settings.musicTrack)
    else stopMusic()
  }, [settings.music, settings.musicTrack])

  useEffect(() => () => stopMusic(), [])

  // 原生 App 集成
  useEffect(() => {
    // 首屏渲染好后再隐藏启动屏
    setTimeout(() => hideSplash(), 200)
    setStatusBar('dark', '#ffd9e8')

    // App 进后台时暂停音乐（省电、避免被锁屏切走还在响）
    const offState = onAppStateChange(isActive => {
      if (!isActive) stopMusic()
      else if (settings.music) startMusic(settings.musicTrack)
    })

    // Android 返回键：非主页就回主页，主页则放行让原生退出
    const offBack = onBackButton(() => {
      if (screen !== 'home') { setScreen('home'); return true }
      return false
    })

    return () => { offState(); offBack() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  // 签到 streak（给 home 用）
  const checkin = store.getCheckin()

  const handleClaim = (reward) => {
    if (reward?.type === '💰') setCoins(coins + reward.n)
    setClaimToast(`领取成功：${reward.label || reward.type} ${reward.label ? '' : '×' + reward.n}`)
    setTimeout(() => setClaimToast(null), 2200)
  }

  const go = (id) => {
    // 首次任意点击都会触发 AudioContext.resume（满足浏览器手势策略）
    if (settings.music) startMusic(settings.musicTrack)
    setScreen(id)
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          onGo={go}
          coins={coins}
          learned={learned.size}
          streak={checkin.streak}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          onBack={() => go('home')}
          coins={coins} setCoins={setCoins}
          learned={learned} setLearned={setLearned}
          bumpStat={bumpStat}
          sfxOn={settings.sfx}
        />
      )}

      {screen === 'review' && (
        <ReviewScreen onBack={() => go('home')} learned={learned} stats={stats} />
      )}

      {screen === 'daily' && (
        <DailyScreen onBack={() => go('home')} onClaim={handleClaim} />
      )}

      {screen === 'ranking' && (
        <RankingScreen onBack={() => go('home')} learned={learned} />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          onBack={() => go('home')}
          onSettingsChange={setSettings}
        />
      )}

      {screen === 'about' && (
        <AboutScreen onBack={() => go('home')} />
      )}

      {claimToast && (
        <div className="toast">{claimToast}</div>
      )}

      {/* 全局音乐开关 — 所有页面右上角醒目位置 */}
      <MusicToggle />
    </div>
  )
}
