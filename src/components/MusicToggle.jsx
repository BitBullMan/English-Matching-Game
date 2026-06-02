import React, { useEffect, useState } from 'react'
import { store } from '../utils/store.js'
import { startMusic, stopMusic } from '../utils/music.js'

// 全局音乐开关 — 固定屏幕右上角，所有页面都可见
// 点击即开关；首次点击会激活 AudioContext（绕过浏览器自动播放限制）
export default function MusicToggle() {
  const [on, setOn] = useState(() => {
    const s = store.getSettings()
    return s.music !== false
  })
  const [pulse, setPulse] = useState(false)

  // 初次脉冲 3 秒提示用户存在
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 3000)
    setPulse(true)
    return () => clearTimeout(t)
  }, [])

  const toggle = () => {
    const s = store.getSettings()
    const next = !on
    setOn(next)
    store.setSettings({ ...s, music: next })
    if (next) startMusic(s.musicTrack || 'kawaii')
    else stopMusic()
  }

  return (
    <button
      className={`music-toggle ${on ? 'on' : 'off'} ${pulse ? 'pulse' : ''}`}
      onClick={toggle}
      aria-label={on ? '关闭背景音乐' : '开启背景音乐'}
      title={on ? '🎵 音乐已开 · 点击关闭' : '🔇 静音中 · 点击开启音乐'}
    >
      <span className="mt-icon">{on ? '🎵' : '🔇'}</span>
      <span className="mt-bars" aria-hidden="true">
        <span /><span /><span />
      </span>
    </button>
  )
}
