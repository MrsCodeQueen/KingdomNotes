// Lightweight reverse proxy: forwards :8001 -> :3000 (the Next.js server).
// Needed only in this preview environment, whose ingress routes /api/* to port
// 8001 (the default FastAPI slot). This app is a pure Next.js app that serves
// its own /api/* on port 3000, so we bridge 8001 -> 3000. This does NOT change
// the app's architecture; it is an environment-only shim.
import http from 'node:http'

const TARGET_HOST = '127.0.0.1'
const TARGET_PORT = 3000
const LISTEN_PORT = 8001

const server = http.createServer((req, res) => {
  const opts = {
    host: TARGET_HOST,
    port: TARGET_PORT,
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` },
  }
  const proxyReq = http.request(opts, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
    proxyRes.pipe(res)
  })
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'content-type': 'text/plain' })
    res.end('dev-proxy upstream error: ' + err.message)
  })
  req.pipe(proxyReq)
})

// Support websockets/upgrade (Next dev HMR) just in case.
server.on('upgrade', (req, socket, head) => {
  const opts = {
    host: TARGET_HOST,
    port: TARGET_PORT,
    method: req.method,
    path: req.url,
    headers: req.headers,
  }
  const proxyReq = http.request(opts)
  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    const head2 = ['HTTP/1.1 101 Switching Protocols']
    for (const [k, v] of Object.entries(proxyRes.headers)) head2.push(`${k}: ${v}`)
    socket.write(head2.join('\r\n') + '\r\n\r\n')
    if (proxyHead && proxyHead.length) proxySocket.unshift(proxyHead)
    proxySocket.pipe(socket)
    socket.pipe(proxySocket)
  })
  proxyReq.on('error', () => socket.destroy())
  proxyReq.end()
})

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`dev-proxy listening on :${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`)
})
