// ui/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT || 5174),
    strictPort: true,
    proxy: {
      // Spring Boot (8081)
      '/khik-bank': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      // FAST servisi (8085) – yoksa yine de UI tarafı up olur
      '/khik-fast': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
