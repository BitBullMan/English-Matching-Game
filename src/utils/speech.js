// 语音播放抽象层
// ========================================================
// 关于 "Arbor" 音色
// ========================================================
// 你截图的 Arbor / Breeze / Cove / Ember / Juniper / Maple / Sol / Spruce / Vale
// 这 9 个是 ChatGPT 应用（Advanced Voice / Realtime API）专属音色，
// **OpenAI TTS REST API 里没有**。
//
// REST TTS API 现有的 voice 是：
//   alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
//
// 风格上最接近 Arbor（"easygoing and versatile" — 随和、多面）的：
//   1. ash    — 温和中性、偏男声，是新加的更"人味"的 voice  ★推荐英音替代
//   2. sage   — 沉稳成熟、中性偏男                              ★推荐美音替代
//   3. ballad — 抒情、柔和
//
// 想真用 Arbor 必须走 Realtime API（语音对话）或 ElevenLabs 克隆，
// 二者都比 TTS REST 贵且复杂，单词朗读这种场景性价比低。
//
// 模型选择：
//   tts-1            最便宜、最快、音质够用
//   tts-1-hd         音质更好、延迟略高
//   gpt-4o-mini-tts  最新模型、更接近 ChatGPT 应用音色（推荐）★
// ========================================================

import { duckMusic } from './music.js'

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}
const PROVIDER     = ENV.VITE_TTS_PROVIDER     || 'browser'
const OPENAI_KEY   = ENV.VITE_OPENAI_API_KEY
const OPENAI_PROXY = ENV.VITE_OPENAI_TTS_PROXY
const TTS_MODEL    = ENV.VITE_OPENAI_TTS_MODEL || 'gpt-4o-mini-tts'
const VOICE_UK     = ENV.VITE_OPENAI_VOICE_UK  || 'ash'
const VOICE_US     = ENV.VITE_OPENAI_VOICE_US  || 'sage'

// gpt-4o-mini-tts 支持额外的 "instructions" 字段引导风格 —— 接近"Easygoing and versatile"
const INSTRUCTIONS_UK = "Speak in a warm, easygoing British accent. Pronounce the word clearly and naturally, like you're teaching a child a new vocabulary word."
const INSTRUCTIONS_US = "Speak in a warm, easygoing American accent. Pronounce the word clearly and naturally, like you're teaching a child a new vocabulary word."

// —— 浏览器 voices 缓存 ——
let _voices = []
function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  _voices = window.speechSynthesis.getVoices()
  return _voices
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

function pickBrowserVoice(lang) {
  if (!_voices.length) loadVoices()
  const lower = lang.toLowerCase()
  const tiers = [
    v => v.lang.toLowerCase() === lower && /premium|enhanced|neural|natural|siri/i.test(v.name),
    v => v.lang.toLowerCase() === lower,
    v => v.lang && v.lang.toLowerCase().startsWith(lower),
    v => v.lang && v.lang.toLowerCase().startsWith('en')
  ]
  for (const pred of tiers) {
    const v = _voices.find(pred)
    if (v) return v
  }
  return null
}

// —— mp3 缓存 ——
function cachedMp3Url(wordId, accent) {
  const base = (ENV.BASE_URL || '/').replace(/\/$/, '')
  return `${base}/audio/${wordId}-${accent}.mp3`
}

async function tryPlayCached(wordId, accent) {
  if (!wordId) return false
  try {
    const url = cachedMp3Url(wordId, accent)
    const head = await fetch(url, { method: 'HEAD' })
    if (!head.ok) return false
    const audio = new Audio(url)
    await audio.play()
    return true
  } catch (_) {
    return false
  }
}

// —— OpenAI TTS 实时请求 ——
async function playOpenAI(text, accent) {
  const voice = accent === 'uk' ? VOICE_UK : VOICE_US
  const instructions = accent === 'uk' ? INSTRUCTIONS_UK : INSTRUCTIONS_US
  const body = {
    model: TTS_MODEL,
    voice,
    input: text,
    response_format: 'mp3'
  }
  // gpt-4o-mini-tts 支持 instructions
  if (TTS_MODEL === 'gpt-4o-mini-tts') body.instructions = instructions
  // tts-1 / tts-1-hd 支持 speed
  if (TTS_MODEL.startsWith('tts-1')) body.speed = accent === 'uk' ? 0.95 : 1.0

  if (OPENAI_PROXY) {
    const r = await fetch(OPENAI_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, model: TTS_MODEL, accent, instructions })
    })
    if (!r.ok) throw new Error('proxy tts failed')
    const blob = await r.blob()
    await new Audio(URL.createObjectURL(blob)).play()
    return true
  }
  if (OPENAI_KEY) {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    })
    if (!r.ok) throw new Error('openai tts ' + r.status)
    const blob = await r.blob()
    await new Audio(URL.createObjectURL(blob)).play()
    return true
  }
  return false
}

// —— 浏览器原生 fallback ——
function playBrowser(text, accent) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false
  // 多 accent 支持：uk → en-GB / us → en-US / zh → zh-CN（普通话，给学中文用）
  const lang =
    accent === 'uk' ? 'en-GB' :
    accent === 'us' ? 'en-US' :
    accent === 'zh' ? 'zh-CN' : 'en-US'
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.rate = accent === 'zh' ? 0.85 : (accent === 'uk' ? 0.85 : 0.9)
  const v = pickBrowserVoice(lang)
  if (v) utter.voice = v
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
  return true
}

/**
 * 播放发音
 * @param {string} text
 * @param {'uk'|'us'} accent
 * @param {string} [wordId]
 */
export async function speak(text, accent = 'uk', wordId) {
  // 朗读期间把背景音乐降下来（避免压住单词）
  // 单词大概 1.2 秒就读完
  duckMusic(1.5)
  if (wordId) {
    const ok = await tryPlayCached(wordId, accent)
    if (ok) return
  }
  if (PROVIDER === 'openai') {
    try {
      const ok = await playOpenAI(text, accent)
      if (ok) return
    } catch (e) {
      console.warn('OpenAI TTS failed, falling back to browser:', e)
    }
  }
  playBrowser(text, accent)
}

export function isSpeechSupported() {
  return (
    (typeof window !== 'undefined' && !!window.speechSynthesis) ||
    PROVIDER === 'openai'
  )
}

export const ttsInfo = {
  provider: PROVIDER,
  model: TTS_MODEL,
  voiceUK: VOICE_UK,
  voiceUS: VOICE_US,
  hasOpenAI: !!(OPENAI_PROXY || OPENAI_KEY)
}
