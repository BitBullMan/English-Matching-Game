import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.englishmatch.app',
  appName: '消消学英语',
  webDir: 'dist',
  // 默认走打包内的 dist；想在手机上调试浏览器实时刷新，把 server 解开
  // server: { url: 'http://192.168.x.x:5173', cleartext: true },

  // iOS / Android 通用
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#ffd9e8',     // 与主页粉色背景一致
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',                  // 浅色背景 → 深色文字
      backgroundColor: '#ffd9e8',
      overlaysWebView: false
    }
  },

  ios: {
    contentInset: 'always',           // 让 WebView 自动避开 safe area
    backgroundColor: '#ffd9e8',
    scheme: 'EnglishMatch'
  },

  android: {
    backgroundColor: '#ffd9e8',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true // 生产环境改 false
  }
}

export default config
