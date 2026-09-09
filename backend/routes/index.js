import { config } from '../config/env.js'
import { routePath, sendJson } from '../utils/helpers.js'
import { healthRoutes } from './health.routes.js'
import { authRoutes } from './auth.routes.js'
import { userRoutes } from './user.routes.js'
import { caseRoutes } from './case.routes.js'
import { documentRoutes } from './document.routes.js'
import { activityRoutes } from './activity.routes.js'

const routes = [healthRoutes, authRoutes, userRoutes, caseRoutes, documentRoutes, activityRoutes]

export async function handleRequest(request, response) {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {}, config.frontendOrigin)
    return
  }
  const path = routePath(request.url)
  for (const route of routes) {
    if (await route(request, response, path)) return
  }
  sendJson(response, 404, { error: 'Route not found.' }, config.frontendOrigin)
}
