import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // In development the site and the API (../forge-gym-backend) run as two processes; /api is forwarded to the API.
  const devApi = loadEnv(mode, import.meta.dirname, '').VITE_DEV_API_URL || 'http://localhost:4000'
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      proxy: { '/api': devApi },
    },
  }
})
