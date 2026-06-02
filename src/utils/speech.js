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
      const en = vs.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'))
      const zh = vs.filter(v => v.lang && v.lang.toLowerCase().startsWith('zh'))
      console.log(`[speech] EN voices (${en.length}):`, en.map(v => `${v.name} [${v.lang}]`).join(', '))
      console.log(`[speech] ZH voices (${zh.length}):`, zh.map(v => `${v.name} [${v.lang}]`).join(', '))
    } else {
      console.warn('[speech] no voices available — system may not have TTS installed')
    }
  })
}

// 偏好女声 — 严格优先本地 voice（localService=true），避免依赖 Google 网络 voice
// macOS Chrome 上 Google 系列 voice 是网络 voice，网速不稳就降级回 Daniel 男声
//
// UK 真正高质量本地女声极少：macOS 默认只有 Martha；Kate/Serena 要手动下载。
// 美音的 Samantha 是 macOS 默认且本地，音质优秀且听感清晰 — 强烈推荐做 UK 学习模式 fallback
const PREFERRED_FEMALE_UK = [
  // macOS Premium/Enhanced (用户需下载，但如有则最佳)
  'Kate', 'Serena', 'Stephanie', 'Fiona', 'Susan',
  // macOS Eloquence (普通本地 voice)
  'Martha', 'Shelley',
  // Windows
  'Hazel', 'Microsoft Hazel', 'Microsoft Susan', 'Microsoft Libby', 'Sonia', 'Mia', 'Abbi'
  // 注意：故意不放 'Google UK English Female'，它是网络 voice 不稳定
]
const PREFERRED_FEMALE_US = [
  // macOS 默认 — Samantha 是 macOS 最稳的女声 ★
  'Samantha', 'Allison', 'Ava', 'Susan', 'Victoria', 'Nicky', 'Kathy',
  // Windows Neural
  'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Ana',
  'Nancy', 'Jane', 'Sara'
]
const PREFERRED_ZH = [
  // macOS 本地中文女声
  'Tingting', 'Sinji', 'Meijia', 'Li-Mu',
  // Windows
  'Microsoft Xiaoxiao', 'Microsoft Yunxi',
  // Google 网络 voice 兜底
  'Google 普通话（中国大陆）'
]

// 学英音模式下，如果系统没有 UK 本地女声，fallback 用 US 高质量女声（Samantha 等）
// 比用低质量 Google UK 网络 voice 听感好得多
const FALLBACK_US_FOR_UK = ['Samantha', 'Allison', 'Ava', 'Victoria', 'Susan']

// 已知男声名 — 用于明确排除（按优先级 fallback 时不选这些）
const KNOWN_MALE_NAMES = /\b(daniel|mike|mark|david|alex|tom|james|guy|jakob|fred|jorge|ryan|brian|oliver|arthur|aaron|albert|bruce|harry|paul|jack|john)\b/i
const MALE_KEYWORDS = /\bmale\b|\bman\b/i

function matchByName(voices, names) {
  for (const n of names) {
    const v = voices.find(x => x.name === n || x.name.includes(n))
    if (v) return v
  }
  return null
}

function isMaleVoice(v) {
  return MALE_KEYWORDS.test(v.name) || KNOWN_MALE_NAMES.test(v.name)
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

  // 2. 偏好女声名单（限本地 voice — 避免不稳定的 Google 网络 voice）
  const namelist =
    accent === 'uk' ? PREFERRED_FEMALE_UK :
    accent === 'us' ? PREFERRED_FEMALE_US :
    accent === 'zh' ? PREFERRED_ZH : []
  const localOnly = inLang.filter(v => v.localService)
  let named = matchByName(localOnly, namelist)
  if (named) return named

  // 3. 学英音模式特殊处理：本地没 UK 女声 → 用本地 US 高质量女声（Samantha 等）
  //    比用 Google 网络 UK 女声听感稳定得多
  if (accent === 'uk') {
    const usLocalFemale = _voices.filter(v =>
      v.localService && v.lang && v.lang.toLowerCase().startsWith('en-us')
    )
    const usNamed = matchByName(usLocalFemale, FALLBACK_US_FOR_UK)
    if (usNamed) return usNamed
  }

  // 4. 本地 voice 中含 female/woman 字样
  const localFemale = localOnly.find(v => /female|woman/i.test(v.name))
  if (localFemale) return localFemale

  // 5. 本地任何非男声
  const localNotMale = localOnly.find(v => !isMaleVoice(v))
  if (localNotMale) return localNotMale

  // 6. 实在没有本地，才用网络 voice（按 namelist 再试一遍非本地）
  named = matchByName(inLang, namelist)
  if (named) return named

  // 7. 含 female/woman
  const female = inLang.find(v => /female|woman/i.test(v.name))
  if (female) return female

  // 8. 任何非男声
  const notMale = inLang.find(v => !isMaleVoice(v))
  if (notMale) return notMale

  // 9. 兜底
  if (inLang.length) return inLang[0]
  const generic = _voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)) && !isMaleVoice(v))
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

// —— 浏览器原生 ——
// 关键：同步触发以保持 iOS 手势上下文 +
//      校正：如果首播挑到男声/默认，等 voices 完整加载后立刻覆盖播一遍正确的女声
function playBrowser(text, accent) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('[speech] speechSynthesis not available')
    return false
  }
  if (!_voices.length) loadVoices()

  const lang =
    accent === 'uk' ? 'en-GB' :
    accent === 'us' ? 'en-US' :
    accent === 'zh' ? 'zh-CN' : 'en-US'

  const makeUtter = (voice) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.volume = 1.0
    u.pitch  = accent === 'uk' ? 1.05 : 1.0
    u.rate   = accent === 'zh' ? 0.85 : 0.95
    if (voice) u.voice = voice
    return u
  }

  const v1 = pickBrowserVoice(lang, accent)
  const firstIsMale = v1 && isMaleVoice(v1)
  if (v1 && !firstIsMale) {
    console.log(`[speech] ${accent}: "${text}" → ${v1.name} (${v1.lang})`)
  } else {
    console.warn(`[speech] first pick for ${lang}: ${v1 ? v1.name : 'default'} (male=${firstIsMale}) — will retry after voices load`)
  }
  window.speechSynthesis.cancel()
  try {
    window.speechSynthesis.speak(makeUtter(v1))
  } catch (e) {
    console.error('[speech] speak failed:', e)
    return false
  }

  // 如果首播没拿到女声（v1 为 null 或男声），等 voices 加载完再校正一次
  if (!v1 || firstIsMale) {
    ensureVoicesReady().then(() => {
      const v2 = pickBrowserVoice(lang, accent)
      if (v2 && v2 !== v1 && !isMaleVoice(v2)) {
        console.log(`[speech] re-played ${accent}: "${text}" with ${v2.name}`)
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(makeUtter(v2))
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
