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
        // Neutral surfaces (dark command-centre feel)
        surface: {
          950: '#070b14',
          900: '#0b111f',
          800: '#111a2e',
          700: '#18233c',
          600: '#22304f',
          500: '#2f3f66',
          400: '#3d5280',
        },
        // Primary accent (indigo — trustworthy, sovereign)
        primary: {
          DEFAULT: '#6366f1',
          50:  '#eef2ff',
          100: '#e0e7ff',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          soft: 'rgba(99,102,241,0.12)',
        },
        // Semantic status colours
        success: { DEFAULT: '#34d399', soft: 'rgba(52,211,153,0.12)' },
        warning: { DEFAULT: '#fbbf24', soft: 'rgba(251,191,36,0.12)' },
        danger:  { DEFAULT: '#f87171', soft: 'rgba(248,113,113,0.12)' },
        info:    { DEFAULT: '#38bdf8', soft: 'rgba(56,189,248,0.12)' },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
