import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 设置为 './' 使打包后的产物可在任意子路径 / WebView / 微信 H5 下打开
  base: './',
  server: {
    host: true,
    port: 5173
  }
})
