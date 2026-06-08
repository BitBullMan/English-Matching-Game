import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true,
    port: 5173
  },
  build: {
    // macOS iCloud 偶尔会留下空"audio 2/" placeholder 目录无法删除，
    // 让 vite 不清空 outDir 跳过这个问题（Vercel 上没这个问题）
    emptyOutDir: false
  }
})
