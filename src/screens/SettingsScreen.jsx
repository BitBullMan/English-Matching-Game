import React, { useState } from 'react'
import { store } from '../utils/store.js'
import { ttsInfo, speak } from '../utils/speech.js'

export default function SettingsScreen({ onBack, onSettingsChange }) {
  const [s, setS] = useState(store.getSettings())

  const update = (patch) => {
    const next = { ...s, ...patch }
    setS(next)
    store.setSettings(next)
    onSettingsChange && onSettingsChange(next)
  }

  return (
    <div className="sub-screen">
      <div className="sub-top">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="sub-title">设置</div>
        <div className="sub-subtitle">v0.3</div>
      </div>

      <div className="set-list">
        <div className="set-group">音频</div>
        <Row label="🔔 操作音效" toggle={s.sfx} onChange={v => update({ sfx: v })} />

        <div className="set-group">学习偏好</div>
        <Choice
          label="🌏 学习模式"
          value={s.learnMode || 'en'}
          options={[
            { v: 'en', l: '我学英语 🇨🇳→🇬🇧' },
            { v: 'zh', l: 'Learn 中文 🇬🇧→🇨🇳' }
          ]}
          onChange={v => update({ learnMode: v })}
        />
        <Choice
          label="📢 默认发音"
          value={s.defaultAccent}
          options={[{ v: 'uk', l: '英音 🇬🇧' }, { v: 'us', l: '美音 🇺🇸' }]}
          onChange={v => update({ defaultAccent: v })}
        />

        {/* 试听 — 让用户立刻听到当前 voice */}
        <div className="set-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#888', fontWeight: 700 }}>🎧 试听语音</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="seg-btn" style={{ flex: 1 }} onClick={() => speak('Hello, I am your English teacher.', 'uk')}>🇬🇧 英音</button>
            <button className="seg-btn" style={{ flex: 1 }} onClick={() => speak('Hello, I am your English teacher.', 'us')}>🇺🇸 美音</button>
            <button className="seg-btn" style={{ flex: 1 }} onClick={() => speak('你好，我是你的中文老师', 'zh')}>🇨🇳 中文</button>
          </div>
        </div>
        <Choice
          label="🎯 每日目标"
          value={String(s.dailyGoal)}
          options={[
            { v: '5', l: '5 词' },
            { v: '8', l: '8 词' },
            { v: '12', l: '12 词' },
            { v: '20', l: '20 词' }
          ]}
          onChange={v => update({ dailyGoal: Number(v) })}
        />

        <div className="set-group">语音引擎</div>
        <div className="set-info">
          <div>当前 provider：<b>{ttsInfo.provider}</b></div>
          <div>模型：<b>{ttsInfo.model}</b></div>
          <div>英音 voice：<b>{ttsInfo.voiceUK}</b></div>
          <div>美音 voice：<b>{ttsInfo.voiceUS}</b></div>
          <div className="set-note">
            ⚠️ 如需 ChatGPT 同款 Arbor 音色，需走 OpenAI Realtime API，
            目前用 ash/sage 作最接近替代。
          </div>
        </div>

        <div className="set-group">数据</div>
        <button className="set-row danger" onClick={() => {
          if (!confirm('确定清除所有学习记录？')) return
          localStorage.clear()
          location.reload()
        }}>
          🗑 清除所有数据
        </button>
      </div>
    </div>
  )
}

function Row({ label, toggle, onChange }) {
  return (
    <div className="set-row">
      <span>{label}</span>
      <button
        className={`toggle ${toggle ? 'on' : ''}`}
        onClick={() => onChange(!toggle)}
        aria-pressed={toggle}
      >
        <span className="knob" />
      </button>
    </div>
  )
}

function Choice({ label, value, options, onChange }) {
  return (
    <div className="set-row">
      <span>{label}</span>
      <div className="seg">
        {options.map(o => (
          <button
            key={o.v}
            className={`seg-btn ${value === o.v ? 'on' : ''}`}
            onClick={() => onChange(o.v)}
          >{o.l}</button>
        ))}
      </div>
    </div>
  )
}
