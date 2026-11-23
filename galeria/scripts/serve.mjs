// Prosty serwer statyczny z gzipem i fallbackiem SPA.
// `vite preview` nie kompresuje odpowiedzi, co zawyżałoby rozmiar JS.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json'])

export function serve(variant, port) {
  const root = path.resolve(`dist/${variant}`)
  const gzipped = new Map()

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    let file = path.join(root, decodeURIComponent(url.pathname))
    if (!file.startsWith(root)) return res.writeHead(403).end()

    let body
    try {
      if (url.pathname.endsWith('/')) throw new Error('directory')
      body = await readFile(file)
    } catch {
      file = path.join(root, 'index.html')
      body = await readFile(file)
    }

    const ext = path.extname(file)
    const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }

    if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
      if (!gzipped.has(file)) gzipped.set(file, gzipSync(body, { level: 9 }))
      body = gzipped.get(file)
      headers['Content-Encoding'] = 'gzip'
      headers.Vary = 'Accept-Encoding'
    }

    headers['Content-Length'] = body.length
    res.writeHead(200, headers).end(body)
  })

  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [variant = 'v0', port = '4170'] = process.argv.slice(2)
  await serve(variant, Number(port))
  console.log(`${variant}: http://127.0.0.1:${port}`)
}
