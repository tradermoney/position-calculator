import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置
  base: process.env.NODE_ENV === 'production' ? '/position-calculator/' : '/',
  server: {
    port: 57319,
    host: '0.0.0.0'
  },
  preview: {
    port: 57319,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保构建产物包含所有必要的文件
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
