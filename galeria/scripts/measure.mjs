// Pomiar Lighthouse wg założeń projektu: profil mobile, Slow 4G (domyślne), pusty cache, 5 przebiegów, mediana.
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import path from 'node:path'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { serve } from './serve.mjs'

const variant = process.argv[2] ?? 'v0'
const RUNS = 5
const PORT = 4300
const URL_UNDER_TEST = `http://127.0.0.1:${PORT}/`
const RAW = path.resolve(`wyniki/raw/${variant}`)
await mkdir(RAW, { recursive: true })

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function extract(lhr) {
  const num = (id) => lhr.audits[id].numericValue
  const requests = lhr.audits['network-requests'].details.items.filter((r) => !r.url.startsWith('data:'))
  const bytes = (type) =>
    requests.filter((r) => !type || r.resourceType === type).reduce((sum, r) => sum + r.transferSize, 0) / 1024

  return {
    lcpMs: num('largest-contentful-paint'),
    fcpMs: num('first-contentful-paint'),
    cls: num('cumulative-layout-shift'),
    tbtMs: num('total-blocking-time'),
    speedIndexMs: num('speed-index'),
    pageKb: bytes(),
    imagesKb: bytes('Image'),
    jsKb: bytes('Script'),
    requests: requests.length,
  }
}

const server = await serve(variant, PORT)
const runs = []

try {
  for (let run = 1; run <= RUNS; run++) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-first-run'] })
    try {
      const result = await lighthouse(URL_UNDER_TEST, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance'],
        // Symulacja (domyślna) dawała tu niewiarygodne czasy, np. 22 ms na obraz 413 KB.
        // DevTools faktycznie dławi łącze i CPU tymi samymi parametrami profilu Slow 4G.
        throttlingMethod: 'devtools',
        // Wersja bazowa waży ok. 39 MB, a to ponad 3 minuty pobierania przy 1,5 Mb/s.
        maxWaitForLoad: 420_000,
      })
      if (result.lhr.runtimeError) throw new Error(result.lhr.runtimeError.message)
      await writeFile(path.join(RAW, `run-${run}.json`), result.report)
      runs.push(extract(result.lhr))
      console.log(`${variant} przebieg ${run}:`, JSON.stringify(runs.at(-1)))
    } finally {
      await chrome.kill()
    }
  }
} finally {
  server.close()
}

const summary = {}
for (const key of Object.keys(runs[0])) {
  const values = runs.map((r) => r[key])
  summary[key] = { median: median(values), min: Math.min(...values), max: Math.max(...values) }
}

// Rozmiar i liczba chunków JS bezpośrednio z builda (rollup-plugin-visualizer).
const stats = JSON.parse(await readFile(path.resolve(`wyniki/bundle/${variant}.json`), 'utf8'))
const parts = Object.values(stats.nodeParts)
const chunks = Object.values(stats.nodeMetas).flatMap((m) => Object.keys(m.moduleParts))
// Suma z visualizera dotyczy modułów przed minifikacją, każdy gzipowany osobno, więc jest zawyżona.
// Dlatego zapisujemy też rozmiar gotowych plików po gzipie, tak jak trafiają do przeglądarki.
const assetsDir = path.resolve(`dist/${variant}/assets`)
const jsFiles = (await readdir(assetsDir)).filter((f) => f.endsWith('.js'))
let builtGzip = 0
for (const file of jsFiles) builtGzip += gzipSync(await readFile(path.join(assetsDir, file)), { level: 9 }).length

const visualizer = {
  modulesGzipKb: parts.reduce((sum, p) => sum + p.gzipLength, 0) / 1024,
  modulesRenderedKb: parts.reduce((sum, p) => sum + p.renderedLength, 0) / 1024,
  builtJsGzipKb: builtGzip / 1024,
  chunks: new Set(chunks).size,
}

const lighthouseVersion = JSON.parse(await readFile(path.join(RAW, 'run-1.json'), 'utf8')).lighthouseVersion
await writeFile(
  path.resolve(`wyniki/${variant}.json`),
  JSON.stringify({ variant, url: URL_UNDER_TEST, measuredAt: new Date().toISOString(), lighthouseVersion, runs, summary, visualizer }, null, 2),
)
console.log('Mediany:', Object.fromEntries(Object.entries(summary).map(([k, v]) => [k, Math.round(v.median * 1000) / 1000])))
console.log('Visualizer:', visualizer)
