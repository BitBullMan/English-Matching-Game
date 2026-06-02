// Capacitor 原生桥接 — Web 环境下安全降级（什么也不做）
// 在 iOS / Android App 里会调用真正的原生 API

let nativeReady = false
let cap = null

async function init() {
  if (nativeReady) return
  nativeReady = true
  try {
    const mod = await import('@capacitor/core')
    cap = mod.Capacitor
  } catch (_) {
    cap = null
  }
}
init()

export function isNative() {
  return !!(cap && cap.isNativePlatform && cap.isNativePlatform())
}

// 启动屏：项目启动后稍微延迟再隐藏（让首屏先画好）
export async function hideSplash() {
  if (!isNative()) return
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch (_) {}
}

// 状态栏：粉色主页背景下用深色文字
export async function setStatusBar(style = 'dark', bg = '#ffd9e8') {
  if (!isNative()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light })
    await StatusBar.setBackgroundColor({ color: bg })
  } catch (_) {}
}

// Android 物理返回键：交给 App 内的路由处理
// callback(canHandle) → true 表示我们已处理，否则原生退出
export function onBackButton(callback) {
  if (!isNative()) return () => {}
  let off = () => {}
  ;(async () => {
    try {
      const { App } = await import('@capacitor/app')
      const handle = await App.addListener('backButton', (e) => {
        const handled = callback(e.canGoBack)
        if (!handled) App.exitApp()
      })
      off = () => handle.remove()
    } catch (_) {}
  })()
  return () => off()
}

// App 进入后台 / 回到前台 — 用于暂停音乐等
export function onAppStateChange(callback) {
  if (!isNative()) return () => {}
  let off = () => {}
  ;(async () => {
    try {
      const { App } = await import('@capacitor/app')
      const handle = await App.addListener('appStateChange', ({ isActive }) => callback(isActive))
      off = () => handle.remove()
    } catch (_) {}
  })()
  return () => off()
}
