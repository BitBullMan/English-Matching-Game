import React, { useState } from 'react'
import { t } from '../utils/i18n.js'

const STEPS = [
  { emoji: '👆', titleKey: 'onboardTitle1', textKey: 'onboardText1' },
  { emoji: '📖', titleKey: 'onboardTitle2', textKey: 'onboardText2' },
  { emoji: '⚠️', titleKey: 'onboardTitle3', textKey: 'onboardText3' },
]

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0)
  const last = i === STEPS.length - 1
  const step = STEPS[i]

  return (
    <div className="overlay" style={{ background: 'rgba(31,39,50,0.78)', zIndex: 2000 }}>
      <div className="modal" style={{ maxWidth: 340, padding: '32px 28px' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{step.emoji}</div>
        <h2 style={{ fontSize: 22 }}>{t(step.titleKey)}</h2>
        <p style={{ fontSize: 15, lineHeight: 1.45 }}>{t(step.textKey)}</p>

        {/* 进度点 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '16px 0' }}>
          {STEPS.map((_, idx) => (
            <span key={idx}
              style={{
                width: idx === i ? 22 : 6,
                height: 6,
                borderRadius: 3,
                background: idx === i ? '#1CB0F6' : '#CCC',
                transition: 'width 0.25s'
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {!last && (
            <button
              className="primary"
              style={{ flex: 1, background: '#e5e5e5', color: '#333', borderBottomColor: '#ccc' }}
              onClick={onDone}
            >{t('onboardSkip')}</button>
          )}
          <button
            className="primary"
            style={{ flex: last ? 1 : 1.4 }}
            onClick={() => last ? onDone() : setI(i + 1)}
          >{last ? t('onboardStart') : t('onboardNext')}</button>
        </div>
      </div>
    </div>
  )
}
