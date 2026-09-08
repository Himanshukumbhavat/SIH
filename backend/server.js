import http from 'node:http'

const port = Number(process.env.API_PORT || 3001)

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  response.end(JSON.stringify(body))
}

const server = http.createServer((request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    response.end()
    return
  }

  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, { status: 'ok', service: 'dems-backend' })
    return
  }

  sendJson(response, 404, { error: 'Route not found' })
})

server.listen(port, () => {
  console.log(`DEMS backend listening on http://localhost:${port}`)
})
