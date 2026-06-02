// 微信小程序里没有 SpeechSynthesis；可选方案：
//   1. 调有道智云 / 讯飞 / 微软 Azure 的 TTS API 返回 mp3 → wx.createInnerAudioContext 播放
//   2. 预生成 mp3 上传到云存储，按 id 播放
//
// 这里给 demo 实现：尝试播放本地音频；没有则用 wx.showToast 提示要接入 TTS

const audioCache = {}

function play(wordId, accent) {
  accent = accent || 'uk'
  const key = wordId + '-' + accent
  // 优先：项目内 /audio/ 下的 mp3（你预生成的 OpenAI TTS 上传到小程序静态资源）
  const url = `/audio/${wordId}-${accent}.mp3`
  let audio = audioCache[key]
  if (!audio) {
    audio = wx.createInnerAudioContext()
    audio.src = url
    audio.onError(() => {
      wx.showToast({ title: '请配置 TTS 服务', icon: 'none', duration: 1500 })
    })
    audioCache[key] = audio
  }
  audio.stop()
  audio.seek(0)
  audio.play()
}

module.exports = { play }
