import path from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendRoot = path.dirname(fileURLToPath(import.meta.url))

export default {
  content: [
    path.join(frontendRoot, 'index.html'),
    path.join(frontendRoot, 'src/**/*.{js,jsx}'),
  ],
  theme: {
    extend: {
      colors: {
        // Light public-service portal surfaces
        surface: {
          950: '#eef3f7',
          900: '#f7f9fc',
          800: '#ffffff',
          700: '#dfe7ee',
          600: '#c8d5df',
          500: '#9aabba',
          400: '#71869a',
        },
        // Teal and violet civic-service identity
        primary: {
          DEFAULT: '#0f766e',
          50:  '#ecfdfb',
          100: '#ccfbf1',
          300: '#24988e',
          400: '#128277',
          500: '#0f766e',
          600: '#0b5f59',
          700: '#084c48',
          soft: 'rgba(15,118,110,0.10)',
        },
        // Semantic status colours
        success: { DEFAULT: '#16834f', soft: 'rgba(22,131,79,0.10)' },
        warning: { DEFAULT: '#c45e16', soft: 'rgba(196,94,22,0.10)' },
        danger:  { DEFAULT: '#b42318', soft: 'rgba(180,35,24,0.10)' },
        info:    { DEFAULT: '#5b21b6', soft: 'rgba(91,33,182,0.10)' },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        serif:   ['"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
}
