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
// 注意：在 Chrome / iOS Safari 上，getVoices() 第一次同步调用会返回空数组，
// 需要等 'voiceschanged' 事件触发后才有数据。如果在 voices 加载完成前 speak，
// 系统会用默认 voice（通常是 en-US 男声）而不会按 lang 匹配，听感差。
let _voices = []
let _voicesReady = null  // Promise，第一次拿到非空 voices 时 resolve

function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  _voices = window.speechSynthesis.getVoices()
  return _voices
}

function ensureVoicesReady() {
  if (_voicesReady) return _voicesReady
  _voicesReady = new Promise(resolve => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return resolve([])
    const got = loadVoices()
    if (got.length) return resolve(got)
    // 监听 voiceschanged
    const handler = () => {
      const vs = loadVoices()
      if (vs.length) {
        window.speechSynthesis.removeEventListener('voiceschanged', handler)
        resolve(vs)
      }
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    // 超时兜底（4 秒后无论如何 resolve）
    setTimeout(() => resolve(_voices), 4000)
  })
  return _voicesReady
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  ensureVoicesReady().then(vs => {
    if (vs && vs.length) {
      console.log(`[speech] loaded ${vs.length} voices`)
    } else {
      console.warn('[speech] no voices available — system may not have TTS installed')
    }
  })
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

// —— iOS 解锁 ——
// iOS Safari 要求第一次 speak 必须在用户手势内同步调用，否则永远静默。
// 也对 WeChat / In-App-Browser 有效。这里在第一次 unlock() 调用时
// 发一个静音 utterance 来激活 SpeechSynthesis 引擎。
let _unlocked = false
export function unlockSpeech() {
  if (_unlocked) return
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    // 静音 utter — 不发声但能"激活"引擎
    const silent = new SpeechSynthesisUtterance(' ')
    silent.volume = 0
    silent.rate = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(silent)
    _unlocked = true
    console.log('[speech] unlocked')
  } catch (e) {
    console.warn('[speech] unlock failed:', e)
  }
}

// —— 浏览器原生（同步版本，保持手势上下文）——
function playBrowser(text, accent) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('[speech] speechSynthesis not available')
    return false
  }
  // 同步加载 voices（即使首次返回空也继续，让浏览器用默认 voice）
  if (!_voices.length) loadVoices()

  const lang =
    accent === 'uk' ? 'en-GB' :
    accent === 'us' ? 'en-US' :
    accent === 'zh' ? 'zh-CN' : 'en-US'
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.volume = 1.0
  utter.pitch  = accent === 'uk' ? 1.05 : 1.0
  utter.rate   = accent === 'zh' ? 0.85 : 0.95

  const v = pickBrowserVoice(lang, accent)
  if (v) {
    utter.voice = v
    console.log(`[speech] ${accent}: "${text}" → ${v.name} (${v.lang})`)
  } else {
    console.warn(`[speech] no voice for ${lang}, using browser default`)
  }

  window.speechSynthesis.cancel()
  try {
    window.speechSynthesis.speak(utter)
  } catch (e) {
    console.error('[speech] speak failed:', e)
    return false
  }

  // 如果 voices 还没加载，加载完后重播一次（仅在第一次 voices 异步加载后用）
  if (!v && !_voices.length) {
    ensureVoicesReady().then(() => {
      const v2 = pickBrowserVoice(lang, accent)
      if (v2) {
        const u2 = new SpeechSynthesisUtterance(text)
        u2.lang = lang
        u2.volume = 1.0
        u2.pitch = utter.pitch
        u2.rate = utter.rate
        u2.voice = v2
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(u2)
        console.log(`[speech] re-played ${accent}: "${text}" with ${v2.name}`)
      }
    })
  }
  return true
}

/**
 * 播放发音
 * @param {string} text
 * @param {'uk'|'us'|'zh'} accent
 * @param {string} [wordId]
 */
export function speak(text, accent = 'uk', wordId) {
  // 关键：同步路径优先 — iOS Safari/WeChat 必须在用户手势内同步 speak
  // 浏览器 voice 立刻打开，cached mp3 / OpenAI 走异步
  unlockSpeech()
  playBrowser(text, accent)

  // 异步增强（如果有 mp3 缓存或 openai 就播更好的）
  ;(async () => {
    duckMusic(1.5)
    if (wordId) {
      const ok = await tryPlayCached(wordId, accent)
      if (ok) {
        // 缓存命中后取消浏览器 voice 避免双重播放
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel()
        }
        return
      }
    }
    if (PROVIDER === 'openai') {
      try {
        const ok = await playOpenAI(text, accent)
        if (ok && typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel()
        }
      } catch (e) {
        console.warn('OpenAI TTS failed:', e)
      }
    }
  })()
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
