import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: {
      // 禁用HMR的WebSocket连接，避免连接失败的错误
      port: 24678,
    },
    // 设置明确的服务器配置
    host: 'localhost',
    port: 5173,
  },
})
