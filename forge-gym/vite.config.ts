import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // In development the site and the API run as two processes; /api is forwarded to the API.
  const apiPort = loadEnv(mode, import.meta.dirname, '').PORT || '4000'
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      proxy: { '/api': `http://localhost:${apiPort}` },
    },
  }
})
