import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 57319,
    host: '0.0.0.0'
  },
  preview: {
    port: 57319,
    host: '0.0.0.0'
  }
})
