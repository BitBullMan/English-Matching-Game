// 语音播放抽象层
// ========================================================
// 三层 fallback：mp3 缓存 → OpenAI TTS → 浏览器 SpeechSynthesis
// ========================================================
//
// 关于 OpenAI TTS Voice：
//   你截图里的 Arbor 是 ChatGPT 应用专属，REST TTS API 没有。
//   API 可用：alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
//   最接近 Arbor（easygoing & versatile）的：ash / sage / ballad
//
// 浏览器 voice 优先级（学英语场景需要"清晰响亮"）：
//   优先挑女声 — 女声共振峰高，听起来更清晰、更易模仿
//   英音：Kate (Premium) > Serena > Google UK English Female > 任何 en-GB Female
//   美音：Samantha > Allison > Google US English Female > 任何 en-US Female
// ========================================================

import { duckMusic } from './music.js'

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}
const PROVIDER     = ENV.VITE_TTS_PROVIDER     || 'browser'
const OPENAI_KEY   = ENV.VITE_OPENAI_API_KEY
const OPENAI_PROXY = ENV.VITE_OPENAI_TTS_PROXY
const TTS_MODEL    = ENV.VITE_OPENAI_TTS_MODEL || 'gpt-4o-mini-tts'
const VOICE_UK     = ENV.VITE_OPENAI_VOICE_UK  || 'ash'
const VOICE_US     = ENV.VITE_OPENAI_VOICE_US  || 'sage'

const INSTRUCTIONS_UK = "Speak in a clear, warm British accent. Pronounce the word naturally, like a friendly teacher introducing a new word."
const INSTRUCTIONS_US = "Speak in a clear, warm American accent. Pronounce the word naturally, like a friendly teacher introducing a new word."

// 用户手动选择的 voice URI（在设置里挑）— 优先于自动挑
function getUserVoiceURI(accent) {
  try {
    const s = JSON.parse(localStorage.getItem('eng-match-v1:settings') || '{}')
    if (accent === 'uk') return s.voiceURI_uk || null
    if (accent === 'us') return s.voiceURI_us || null
    if (accent === 'zh') return s.voiceURI_zh || null
  } catch (_) {}
  return null
}

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

// 清晰响亮的偏好女声名单（macOS/iOS/Chrome 覆盖）
const PREFERRED_FEMALE_UK = [
  'Kate', 'Serena', 'Hazel', 'Stephanie',
  'Google UK English Female',
  'Microsoft Hazel', 'Microsoft Susan', 'Microsoft Libby',
  'Sonia', 'Mia', 'Abbi'   // Microsoft Edge Neural voices
]
const PREFERRED_FEMALE_US = [
  'Samantha', 'Allison', 'Ava', 'Susan', 'Karen',
  'Google US English Female',
  'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Ana',
  'Nancy', 'Jane', 'Sara'
]
const PREFERRED_ZH = [
  'Tingting', 'Sinji', 'Meijia', 'Lisheng',
  'Google 普通话（中国大陆）', 'Microsoft Xiaoxiao', 'Microsoft Yunxi'
]

function matchByName(voices, names) {
  for (const n of names) {
    const v = voices.find(x => x.name === n || x.name.includes(n))
    if (v) return v
  }
  return null
}

function pickBrowserVoice(lang, accent) {
  if (!_voices.length) loadVoices()
  const inLang = _voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 5)))

  // 1. 用户自选优先
  const userURI = getUserVoiceURI(accent)
  if (userURI) {
    const u = _voices.find(v => v.voiceURI === userURI)
    if (u) return u
  }
  // 2. 按偏好女声名单匹配
  const namelist =
    accent === 'uk' ? PREFERRED_FEMALE_UK :
    accent === 'us' ? PREFERRED_FEMALE_US :
    accent === 'zh' ? PREFERRED_ZH : []
  const named = matchByName(inLang, namelist)
  if (named) return named
  // 3. Premium / Enhanced / Neural 且匹配 lang
  const premium = inLang.find(v => /premium|enhanced|neural|natural|siri|wavenet/i.test(v.name))
  if (premium) return premium
  // 4. 名字含 "Female" 字样
  const female = inLang.find(v => /female|woman/i.test(v.name))
  if (female) return female
  // 5. 任何匹配 lang 的
  if (inLang.length) return inLang[0]
  // 6. 任何同前缀的（en / zh）
  const generic = _voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)))
  return generic || null
}

// 暴露给设置页：列出某 accent 可用的 voice
export function listVoicesFor(accent) {
  if (!_voices.length) loadVoices()
  const lang = accent === 'uk' ? 'en-gb' : accent === 'us' ? 'en-us' : accent === 'zh' ? 'zh' : 'en'
  return _voices
    .filter(v => v.lang && v.lang.toLowerCase().startsWith(lang))
    .map(v => ({ uri: v.voiceURI, name: v.name, lang: v.lang }))
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
    audio.volume = 1.0
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
  const body = { model: TTS_MODEL, voice, input: text, response_format: 'mp3' }
  if (TTS_MODEL === 'gpt-4o-mini-tts') body.instructions = instructions
  if (TTS_MODEL.startsWith('tts-1')) body.speed = accent === 'uk' ? 0.95 : 1.0

  if (OPENAI_PROXY) {
    const r = await fetch(OPENAI_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, model: TTS_MODEL, accent, instructions })
    })
    if (!r.ok) throw new Error('proxy tts failed')
    const blob = await r.blob()
    const a = new Audio(URL.createObjectURL(blob)); a.volume = 1.0
    await a.play()
    return true
  }
  if (OPENAI_KEY) {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify(body)
    })
    if (!r.ok) throw new Error('openai tts ' + r.status)
    const blob = await r.blob()
    const a = new Audio(URL.createObjectURL(blob)); a.volume = 1.0
    await a.play()
    return true
  }
  return false
}

// —— 浏览器原生 fallback ——
function playBrowser(text, accent) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false
  const lang =
    accent === 'uk' ? 'en-GB' :
    accent === 'us' ? 'en-US' :
    accent === 'zh' ? 'zh-CN' : 'en-US'
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  // 关键参数：
  utter.volume = 1.0                                   // 最大音量
  utter.pitch  = accent === 'uk' ? 1.05 : 1.0          // 英音稍提调，更明亮
  utter.rate   = accent === 'zh' ? 0.8                 // 中文要慢一点
              : accent === 'uk' ? 0.92                 // 英音从 0.85 提到 0.92（不再拖沓）
              : 0.95                                   // 美音
  const v = pickBrowserVoice(lang, accent)
  if (v) utter.voice = v
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
  return true
}

/**
 * 播放发音
 * @param {string} text
 * @param {'uk'|'us'|'zh'} accent
 * @param {string} [wordId]
 */
export async function speak(text, accent = 'uk', wordId) {
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
