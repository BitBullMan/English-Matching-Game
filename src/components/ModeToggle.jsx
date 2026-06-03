import React, { useEffect, useState } from 'react'
import { store } from '../utils/store.js'
import { unlockSpeech } from '../utils/speech.js'

// 全局顶部模式切换 — 替代原音乐按钮位置
// 显示当前学习模式：EN（学英语）↔ 中（学中文）
export default function ModeToggle({ onChange }) {
  const [mode, setMode] = useState(() => store.getSettings().learnMode || 'en')
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 3000)
    return () => clearTimeout(t)
  }, [])

  const toggle = () => {
    unlockSpeech()                    // 借这次手势激活 iOS 音频
    const next = mode === 'en' ? 'zh' : 'en'
    setMode(next)
    const s = store.getSettings()
    store.setSettings({ ...s, learnMode: next })
    onChange && onChange(next)
    // 立即给视觉反馈：切换后 2 秒脉冲一次
    setPulse(true)
    setTimeout(() => setPulse(false), 1800)
  }

  const isZh = mode === 'zh'

  return (
    <button
      className={`mode-toggle ${isZh ? 'zh' : 'en'} ${pulse ? 'pulse' : ''}`}
      onClick={toggle}
      aria-label={isZh ? '当前学中文 - 点击切换学英文' : '当前学英语 - 点击切换学中文'}
      title={isZh ? '🇨🇳 Learning 中文 · tap to switch to English' : '🇬🇧 学英语 · 点击切换学中文'}
    >
      <span className="mt-main">{isZh ? '中' : 'EN'}</span>
      <span className="mt-sub">{isZh ? 'Learn 中文' : '学英语'}</span>
      <span className="mt-arrow">⇄</span>
    </button>
  )
}
