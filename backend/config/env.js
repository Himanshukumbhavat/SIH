import path from 'node:path'
import { fileURLToPath } from 'node:url'

const backendRoot = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  port: Number(process.env.API_PORT || 3001),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  dataFile: path.resolve(backendRoot, process.env.DATA_FILE || 'data/store.json'),
  uploadDir: path.resolve(backendRoot, 'uploads'),
}
