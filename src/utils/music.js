// 背景音乐库 — 4 种曲风可切换
// 参考主流学习类 App：
//   🎮 Kawaii Pop   — 类 Lingokids，明快上扬，C-Am-F-G 卡农圈
//   ☕ Lo-Fi Study  — 类 Lofi Girl，慢爵士七和弦，适合专注
//   👾 8-bit Retro  — 类 Pokemon 红蓝，方波 + 跳跃旋律
//   🌿 Forest Calm  — 类 Headspace/Calm，宽 pad + 随机风铃
//
// 全部 Web Audio API 合成，0 外部文件、0 授权风险
// 想换成真实 mp3：见文件底部 mp3 模式

const ENGINE = 'synth' // 'synth' | 'mp3'

// ==========================================================
// Web Audio 引擎（公共）
// ==========================================================
let ctx = null
let master = null       // 总音量（所有都过这里）
let musicMaster = null  // 背景音乐独立母线（可被 duck）
let sfxBus = null       // 音效不参与 ducking
let busGains = {}        // melody / bass / pad / drum
let currentLoopTimer = null
let currentTrackId = null
let running = false

// 音量参数（关键：背景音乐基础音量低，避免压制单词发音）
const MUSIC_BASE_VOL = 0.12   // 背景音乐基础音量
const MUSIC_DUCK_VOL = 0.02   // 单词朗读时降到的音量
const SFX_VOL        = 0.55   // 一次性音效

function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12) }

const C = 60, D = 62, E = 64, F = 65, G = 67, A = 69, B = 71

function ensureCtx() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 1.0
  master.connect(ctx.destination)

  // 背景音乐独立母线 → 单词朗读时只 duck 这一路
  musicMaster = ctx.createGain()
  musicMaster.gain.value = MUSIC_BASE_VOL
  musicMaster.connect(master)

  // 音效母线（不被 duck）
  sfxBus = ctx.createGain()
  sfxBus.gain.value = SFX_VOL
  sfxBus.connect(master)

  for (const k of ['melody', 'bass', 'pad', 'drum']) {
    const g = ctx.createGain()
    g.gain.value = 0.5
    g.connect(musicMaster)
    busGains[k] = g
  }
  busGains.sfx = sfxBus
  return ctx
}

// ====== Ducking — 给 speech.js 调用 ======
// 在单词朗读前调一下：背景音乐渐弱
export function duckMusic(durationSec = 1.5) {
  if (!musicMaster || !running) return
  const now = ctx.currentTime
  musicMaster.gain.cancelScheduledValues(now)
  musicMaster.gain.setTargetAtTime(MUSIC_DUCK_VOL, now, 0.05)
  // durationSec 之后渐回原音量
  setTimeout(() => {
    if (!musicMaster) return
    const n = ctx.currentTime
    musicMaster.gain.cancelScheduledValues(n)
    musicMaster.gain.setTargetAtTime(MUSIC_BASE_VOL, n, 0.3)
  }, durationSec * 1000)
}

function tone({ freq, when, dur, type='triangle', dest, attack=0.01, release=0.08, peak=0.9 }) {
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.connect(env)
  env.connect(dest)
  env.gain.setValueAtTime(0, when)
  env.gain.linearRampToValueAtTime(peak, when + attack)
  env.gain.setValueAtTime(peak, when + Math.max(attack, dur - release))
  env.gain.exponentialRampToValueAtTime(0.0001, when + dur)
  osc.start(when)
  osc.stop(when + dur + 0.02)
}

function noise(when, dur, dest, peak=0.4, hpFreq=null) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const env = ctx.createGain()
  env.gain.value = peak
  if (hpFreq) {
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = hpFreq
    src.connect(f); f.connect(env)
  } else {
    src.connect(env)
  }
  env.connect(dest)
  src.start(when)
}

function kick(when) {
  const o = ctx.createOscillator()
  const e = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(120, when)
  o.frequency.exponentialRampToValueAtTime(40, when + 0.12)
  e.gain.setValueAtTime(1, when)
  e.gain.exponentialRampToValueAtTime(0.0001, when + 0.15)
  o.connect(e); e.connect(busGains.drum)
  o.start(when); o.stop(when + 0.18)
}

// ==========================================================
// 曲目 1：🎮 Kawaii Pop  — 当前的明快和弦循环
// ==========================================================
const KAWAII = {
  bpm: 96,
  beatsPerChord: 8,
  chords: [
    { r: C,    t: E, f: G },     // C
    { r: A-12, t: C, f: E },     // Am
    { r: F,    t: A, f: C+12 },  // F
    { r: G,    t: B, f: D+12 }   // G
  ],
  melody: [
    [E+12,0,G+12,E+12,C+12,0,G,E],
    [A+12,0,C+24,A+12,E+12,0,A,C+12],
    [F+12,0,A+12,F+12,C+12,0,A,F],
    [G+12,0,B+12,D+24,B+12,0,G,D+12]
  ]
}

function playKawaii(t0) {
  const E8 = 60 / KAWAII.bpm / 2
  busGains.melody.gain.value = 0.35
  busGains.bass.gain.value   = 0.30
  busGains.pad.gain.value    = 0.18
  busGains.drum.gain.value   = 0.35
  KAWAII.chords.forEach((ch, ci) => {
    const cs = t0 + ci * KAWAII.beatsPerChord * E8
    const padDur = KAWAII.beatsPerChord * E8
    tone({ freq: hz(ch.r+12), when: cs, dur: padDur, type: 'sine', dest: busGains.pad, attack: 0.4, release: 0.4, peak: 0.7 })
    tone({ freq: hz(ch.t+12), when: cs, dur: padDur, type: 'sine', dest: busGains.pad, attack: 0.4, release: 0.4, peak: 0.5 })
    tone({ freq: hz(ch.f+12), when: cs, dur: padDur, type: 'sine', dest: busGains.pad, attack: 0.4, release: 0.4, peak: 0.4 })
    const bp = [ch.r, 0, ch.r, 0, ch.f, 0, ch.r, 0]
    bp.forEach((b, i) => {
      if (b) tone({ freq: hz(b-12), when: cs+i*E8, dur: E8*1.8, type: 'triangle', dest: busGains.bass, peak: 1.0 })
    })
    KAWAII.melody[ci].forEach((m, i) => {
      if (m) tone({ freq: hz(m), when: cs+i*E8, dur: E8*1.4, type: 'triangle', dest: busGains.melody, peak: 0.9 })
    })
    for (let b = 0; b < KAWAII.beatsPerChord / 2; b++) {
      const t = cs + b * E8 * 2
      if (b % 2 === 0) kick(t)
      else noise(t, 0.05, busGains.drum, 0.5)
    }
  })
  return KAWAII.chords.length * KAWAII.beatsPerChord * E8
}

// ==========================================================
// 曲目 2：☕ Lo-Fi Study  — 慢节奏爵士七和弦，没有打击只有 hi-hat
// ==========================================================
const LOFI = {
  bpm: 72,
  beatsPerChord: 8,
  // ii-V-I-vi 爵士进行 in C：Dm7 - G7 - Cmaj7 - Am7
  chords: [
    { r: D-12, notes: [D, F, A, C+12] },     // Dm7
    { r: G-12, notes: [G, B, D+12, F+12] },  // G7
    { r: C-12, notes: [C, E, G, B+12] },     // Cmaj7
    { r: A-24, notes: [A-12, C, E, G+12] }   // Am7
  ],
  // 简单上行旋律，散步式
  melody: [
    [F+12,0,A+12,0,C+24,0,A+12,0],
    [B+12,0,D+24,0,F+24,0,D+24,0],
    [E+12,0,G+12,0,B+12,0,G+12,0],
    [C+12,0,E+12,0,G+12,0,E+12,0]
  ]
}

function playLofi(t0) {
  const E8 = 60 / LOFI.bpm / 2
  busGains.melody.gain.value = 0.28
  busGains.bass.gain.value   = 0.40
  busGains.pad.gain.value    = 0.22
  busGains.drum.gain.value   = 0.18
  LOFI.chords.forEach((ch, ci) => {
    const cs = t0 + ci * LOFI.beatsPerChord * E8
    const padDur = LOFI.beatsPerChord * E8
    // 七和弦：4 个音
    ch.notes.forEach((n, i) => {
      tone({ freq: hz(n+12), when: cs, dur: padDur, type: 'sine', dest: busGains.pad,
             attack: 0.6, release: 0.6, peak: 0.5 - i*0.05 })
    })
    // bass walking：根音 - 三音 - 根音 - 五音 慢
    const bp = [ch.r, 0, 0, 0, ch.r+7, 0, 0, 0]
    bp.forEach((b, i) => {
      if (b) tone({ freq: hz(b-12), when: cs+i*E8, dur: E8*3, type: 'triangle', dest: busGains.bass, peak: 1.0, release: 0.2 })
    })
    // 旋律 — 钢琴感（正弦+短 release）
    LOFI.melody[ci].forEach((m, i) => {
      if (m) tone({ freq: hz(m), when: cs+i*E8, dur: E8*1.6, type: 'sine', dest: busGains.melody, peak: 0.9, attack: 0.005, release: 0.4 })
    })
    // hi-hat — 每个八分音符一个轻噪音
    for (let i = 0; i < LOFI.beatsPerChord; i++) {
      noise(cs + i * E8, 0.03, busGains.drum, i % 2 === 0 ? 0.18 : 0.10, 6000)
    }
  })
  return LOFI.chords.length * LOFI.beatsPerChord * E8
}

// ==========================================================
// 曲目 3：👾 8-bit Retro  — 方波 + 跳跃旋律，类宝可梦城镇
// ==========================================================
const CHIP = {
  bpm: 130,
  beatsPerChord: 8,
  // I-V-vi-IV：C-G-Am-F（流行进行）
  chords: [
    { r: C,    five: G    },
    { r: G,    five: D+12 },
    { r: A-12, five: E    },
    { r: F,    five: C+12 }
  ],
  // 跳跃式 arpeggio
  melody: [
    [G+12, E+12, C+12, G+12, E+12, C+12, G,   C+12],
    [D+24, B+12, G+12, D+12, B+12, G,    D+12, B+12],
    [E+24, C+24, A+12, E+12, C+12, A,    E+12, C+12],
    [C+24, A+12, F+12, C+12, A,    F,    C+12, A+12]
  ]
}

function playChip(t0) {
  const E8 = 60 / CHIP.bpm / 2
  busGains.melody.gain.value = 0.30
  busGains.bass.gain.value   = 0.35
  busGains.pad.gain.value    = 0.10
  busGains.drum.gain.value   = 0.30
  CHIP.chords.forEach((ch, ci) => {
    const cs = t0 + ci * CHIP.beatsPerChord * E8
    // bass：跳跃八度  根-八-五-八
    const bp = [ch.r, ch.r+12, ch.five, ch.r+12, ch.r, ch.r+12, ch.five, ch.r+12]
    bp.forEach((b, i) => {
      tone({ freq: hz(b-12), when: cs+i*E8, dur: E8*0.7, type: 'square', dest: busGains.bass, peak: 0.6, attack: 0.001, release: 0.02 })
    })
    // 主旋律：方波短促
    CHIP.melody[ci].forEach((m, i) => {
      tone({ freq: hz(m), when: cs+i*E8, dur: E8*0.6, type: 'square', dest: busGains.melody, peak: 0.55, attack: 0.001, release: 0.02 })
    })
    // 鼓：每拍 kick
    for (let i = 0; i < CHIP.beatsPerChord; i += 2) kick(cs + i * E8)
  })
  return CHIP.chords.length * CHIP.beatsPerChord * E8
}

// ==========================================================
// 曲目 4：🌿 Forest Calm  — 宽 pad + 随机风铃
// ==========================================================
const FOREST = {
  bpm: 60,
  loopSec: 12  // 12 秒一段
}

function playForest(t0) {
  busGains.melody.gain.value = 0.30
  busGains.bass.gain.value   = 0.25
  busGains.pad.gain.value    = 0.35
  busGains.drum.gain.value   = 0.0
  // Pad：C 大七和弦，超长持续
  ;[C, E, G, B].forEach((n, i) => {
    tone({ freq: hz(n), when: t0, dur: FOREST.loopSec, type: 'sine', dest: busGains.pad,
           attack: 1.5, release: 1.5, peak: 0.5 - i*0.05 })
  })
  // Bass：超慢根音呼吸
  tone({ freq: hz(C-12), when: t0, dur: FOREST.loopSec/2, type: 'sine', dest: busGains.bass, attack: 2, release: 1, peak: 0.9 })
  tone({ freq: hz(F-12), when: t0 + FOREST.loopSec/2, dur: FOREST.loopSec/2, type: 'sine', dest: busGains.bass, attack: 2, release: 1, peak: 0.9 })
  // 风铃：在循环里散落 6~10 个高频随机音
  const SCALE = [C+24, D+24, E+24, G+24, A+24, C+36, E+36]
  const n = 7
  for (let i = 0; i < n; i++) {
    const t = t0 + (i / n) * FOREST.loopSec + Math.random() * (FOREST.loopSec / n)
    const note = SCALE[Math.floor(Math.random() * SCALE.length)]
    tone({ freq: hz(note), when: t, dur: 1.2, type: 'sine', dest: busGains.melody,
           attack: 0.02, release: 1.0, peak: 0.45 })
  }
  return FOREST.loopSec
}

// ==========================================================
// 调度
// ==========================================================
const TRACKS = {
  kawaii: { name: '🎮 Kawaii Pop', play: playKawaii },
  chip:   { name: '👾 8-bit Retro', play: playChip }
}

export const TRACK_LIST = Object.entries(TRACKS).map(([id, t]) => ({ id, name: t.name }))

function loop() {
  if (!running) return
  const track = TRACKS[currentTrackId]
  if (!track) return
  const duration = track.play(ctx.currentTime + 0.05)
  currentLoopTimer = setTimeout(loop, duration * 1000)
}

export function startMusic(trackId = 'kawaii') {
  if (ENGINE !== 'synth') return startMp3()
  const c = ensureCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume()
  if (running && currentTrackId === trackId) return
  // 切歌
  if (running) stopMusic(true)
  currentTrackId = trackId
  running = true
  loop()
}

export function stopMusic(silent = false) {
  if (ENGINE !== 'synth') return stopMp3()
  running = false
  if (currentLoopTimer) clearTimeout(currentLoopTimer)
  currentLoopTimer = null
  if (!silent && musicMaster) {
    // 渐弱
    musicMaster.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
    setTimeout(() => { if (musicMaster) musicMaster.gain.value = MUSIC_BASE_VOL }, 400)
  }
}

export function isMusicPlaying() { return running }
export function getCurrentTrack() { return currentTrackId }

export function setMusicVolume(v) {
  if (!musicMaster) ensureCtx()
  if (musicMaster) musicMaster.gain.value = Math.max(0, Math.min(1, v))
}

export function isMusicSupported() {
  return !!(window.AudioContext || window.webkitAudioContext)
}

// ==========================================================
// SFX
// ==========================================================
export function playDing() {
  const c = ensureCtx(); if (!c) return
  if (c.state === 'suspended') c.resume()
  const now = c.currentTime
  tone({ freq: hz(C+24), when: now,        dur: 0.12, type: 'triangle', dest: busGains.sfx })
  tone({ freq: hz(E+24), when: now + 0.07, dur: 0.12, type: 'triangle', dest: busGains.sfx })
  tone({ freq: hz(G+24), when: now + 0.14, dur: 0.22, type: 'sine',     dest: busGains.sfx })
}

export function playTap() {
  const c = ensureCtx(); if (!c) return
  if (c.state === 'suspended') c.resume()
  tone({ freq: hz(G+12), when: c.currentTime, dur: 0.06, type: 'sine', dest: busGains.sfx, peak: 0.4 })
}

export function playReward() {
  const c = ensureCtx(); if (!c) return
  if (c.state === 'suspended') c.resume()
  const now = c.currentTime
  ;[C, E, G, C+12, E+12, G+12].forEach((n, i) => {
    tone({ freq: hz(n+12), when: now + i * 0.07, dur: 0.18, type: 'triangle', dest: busGains.sfx, peak: 0.85 })
  })
}

// ==========================================================
// MP3 模式备用（想用真实音频时启用）
// ==========================================================
let bgAudio = null
function startMp3() {
  if (!bgAudio) {
    bgAudio = new Audio('/music/loop.mp3')
    bgAudio.loop = true
    bgAudio.volume = 0.35
  }
  bgAudio.play().catch(() => {})
}
function stopMp3() {
  if (bgAudio) { bgAudio.pause(); bgAudio.currentTime = 0 }
}
