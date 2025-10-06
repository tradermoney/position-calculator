import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 统一使用 /position-calculator/ 路径，开发和生产环境保持一致
  base: '/position-calculator/',
  server: {
    port: 5173,
    host: '0.0.0.0'
  },
  preview: {
    port: 5173,
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
