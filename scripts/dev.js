import { spawn } from 'node:child_process'

const processes = [
  spawn(process.execPath, ['backend/server.js'], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--config', 'frontend/vite.config.js'], { stdio: 'inherit' }),
]

let shuttingDown = false

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of processes) {
    if (!child.killed) child.kill()
  }
  process.exitCode = code
}

for (const child of processes) {
  child.on('error', (error) => {
    console.error('Development process failed:', error.message)
    shutdown(1)
  })
  child.on('exit', (code, signal) => {
    if (!shuttingDown && (code !== 0 || signal)) shutdown(code || 1)
  })
}

process.on('SIGINT', () => shutdown())
process.on('SIGTERM', () => shutdown())
