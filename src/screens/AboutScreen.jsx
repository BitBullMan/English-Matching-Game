import React from 'react'
import { t } from '../utils/i18n.js'

export default function AboutScreen({ onBack }) {
  return (
    <div className="sub-screen">
      <div className="sub-top">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="sub-title">{t('aboutTitle')}</div>
        <div className="sub-subtitle">v1.0</div>
      </div>

      <div className="about-body">
        <div className="about-hero">
          <div className="about-mascot">🐼</div>
          <h2>{t('appTitleMain')}</h2>
          <p>{t('aboutTagline')}</p>
        </div>

        <div className="about-block">
          <div className="ab-title">{t('aboutHowTitle')}</div>
          <p>{t('aboutHowText')}</p>
        </div>

        <div className="about-block">
          <div className="ab-title">{t('aboutVocabTitle')}</div>
          <p>{t('aboutVocabText')}</p>
        </div>

        <div className="about-block">
          <div className="ab-title">{t('aboutAudioTitle')}</div>
          <p>{t('aboutAudioText')}</p>
        </div>

        <div className="about-block">
          <div className="ab-title">{t('aboutRoadmapTitle')}</div>
          <ul>
            <li>📱 iOS / Android App</li>
            <li>💬 WeChat Mini Program</li>
            <li>🔁 SRS (Spaced Repetition System)</li>
            <li>👥 Multiplayer rooms</li>
            <li>🎨 AI-generated custom topics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
