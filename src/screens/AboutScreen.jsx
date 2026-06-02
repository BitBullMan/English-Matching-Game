import React from 'react'

export default function AboutScreen({ onBack }) {
  return (
    <div className="sub-screen">
      <div className="sub-top">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="sub-title">关于</div>
        <div className="sub-subtitle">v0.3</div>
      </div>

      <div className="about-body">
        <div className="about-hero">
          <div className="about-mascot">🐼</div>
          <h2>消消学英语</h2>
          <p>English Match — 三消的玩法，单词卡的快感</p>
        </div>

        <div className="about-block">
          <div className="ab-title">🎮 怎么玩</div>
          <p>点击棋盘上没被遮挡的卡片，凑齐 3 张相同就消除，每次消除会弹出该词的英文 / 中文 / 英美音标 / 发音。卡满 7 格未消除则失败。</p>
        </div>

        <div className="about-block">
          <div className="ab-title">📚 词库</div>
          <p>30+ 词，混合食物 / 生活 / 服饰 / 文具 / 厨房 / 动物 6 个主题。每个词都有中英双语例句和记忆点。</p>
        </div>

        <div className="about-block">
          <div className="ab-title">🔊 发音</div>
          <p>默认浏览器原生 SpeechSynthesis（免费/离线）；可接入 OpenAI gpt-4o-mini-tts 获得类人音质。</p>
        </div>

        <div className="about-block">
          <div className="ab-title">🚀 路线图</div>
          <ul>
            <li>📱 Capacitor 打包 iOS / Android App</li>
            <li>💬 Taro 迁移微信小程序</li>
            <li>🔁 间隔重复算法（SRS）替代普通复习</li>
            <li>👥 多人对战房间</li>
            <li>🎨 词卡换真实图片代替 emoji</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
