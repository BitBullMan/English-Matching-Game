import React, { useState } from 'react'
import { store } from '../utils/store.js'
import { ttsInfo, speak } from '../utils/speech.js'
import { t } from '../utils/i18n.js'

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
        <div className="sub-title">{t('settingsTitle')}</div>
        <div className="sub-subtitle">v1.0</div>
      </div>

      <div className="set-list">
        <div className="set-group">{t('settingsAudio')}</div>
        <Row label={t('settingsSfx')} toggle={s.sfx} onChange={v => update({ sfx: v })} />

        <div className="set-group">{t('settingsLearning')}</div>
        <Choice
          label={t('settingsMode')}
          value={s.learnMode || 'en'}
          options={[
            { v: 'en', l: t('settingsModeEN') },
            { v: 'zh', l: t('settingsModeZH') }
          ]}
          onChange={v => update({ learnMode: v })}
        />
        <Choice
          label={t('settingsAccent')}
          value={s.defaultAccent}
          options={[
            { v: 'uk', l: t('settingsAccentUK') },
            { v: 'us', l: t('settingsAccentUS') }
          ]}
          onChange={v => update({ defaultAccent: v })}
        />

        {/* 试听 */}
        <div className="set-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#888', fontWeight: 700 }}>{t('settingsPreview')}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="seg-btn" style={{ flex: 1 }} onClick={() => speak('Hello, I am your English teacher.', 'uk')}>🇬🇧 UK</button>
            <button className="seg-btn" style={{ flex: 1 }} onClick={() => speak('Hello, I am your English teacher.', 'us')}>🇺🇸 US</button>
            <button className="seg-btn" style={{ flex: 1 }} onClick={() => speak('你好，我是你的中文老师', 'zh')}>🇨🇳 中</button>
          </div>
        </div>
        <Choice
          label={t('settingsGoal')}
          value={String(s.dailyGoal)}
          options={['5', '8', '12', '20'].map(n => ({ v: n, l: t('wordCount', Number(n)) }))}
          onChange={v => update({ dailyGoal: Number(v) })}
        />

        <div className="set-group">{t('settingsTTSEngine')}</div>
        <div className="set-info">
          <div>{t('settingsTTSProvider')}：<b>{ttsInfo.provider}</b></div>
          <div>{t('settingsTTSModel')}：<b>{ttsInfo.model}</b></div>
          <div>{t('settingsTTSUK')}：<b>{ttsInfo.voiceUK}</b></div>
          <div>{t('settingsTTSUS')}：<b>{ttsInfo.voiceUS}</b></div>
        </div>

        <div className="set-group">{t('settingsData')}</div>
        <button className="set-row danger" onClick={() => {
          if (!confirm(t('settingsConfirmClear'))) return
          localStorage.clear()
          location.reload()
        }}>
          {t('settingsClearData')}
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
