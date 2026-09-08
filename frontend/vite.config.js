import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  css: {
    postcss: {
      plugins: [
        tailwindcss({ config: './frontend/tailwind.config.js' }),
        autoprefixer(),
      ],
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
