// Szczegóły z surowych raportów Lighthouse: kiedy startuje obraz główny, ile obrazów
// pobiera strona i kiedy kończy się ostatnie żądanie. Mediana z przebiegów każdej wersji.
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const VARIANTS = ['v0', 'v1', 'v2', 'v12']

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

const result = {}
for (const variant of VARIANTS) {
  const dir = path.resolve(`wyniki/raw/${variant}`)
  let files
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.json'))
  } catch {
    continue
  }

  const runs = []
  for (const file of files) {
    const lhr = JSON.parse(await readFile(path.join(dir, file), 'utf8'))
    const items = lhr.audits['network-requests'].details.items.filter((r) => !r.url.startsWith('data:'))
    const images = items.filter((r) => r.resourceType === 'Image')
    const hero = images.find((r) => /\/img\/hero/.test(r.url))
    runs.push({
      images: images.length,
      imagesKb: images.reduce((s, r) => s + r.transferSize, 0) / 1024,
      heroStartMs: hero?.networkRequestTime,
      heroEndMs: hero?.networkEndTime,
      heroKb: hero ? hero.transferSize / 1024 : undefined,
      heroPriority: hero?.priority,
      heroUrl: hero?.url.replace(/^https?:\/\/[^/]+/, ''),
      lastRequestEndMs: Math.max(...items.map((r) => r.networkEndTime)),
    })
  }

  const summary = {}
  for (const key of Object.keys(runs[0])) {
    const values = runs.map((r) => r[key])
    summary[key] = typeof values[0] === 'number' ? median(values) : values[0]
  }
  result[variant] = summary
}

await writeFile(path.resolve('wyniki/analiza.json'), JSON.stringify(result, null, 2))

// Dopisuje tabelę do WYNIKI.md (raport z report.mjs musi powstać wcześniej).
const LABELS = { v0: 'Bazowa', v1: 'T1: obrazy', v2: 'T2: lazy loading', v12: 'T1 + T2' }
const ids = Object.keys(result)
const pl = (n, d) => n.toLocaleString('pl-PL', { minimumFractionDigits: d, maximumFractionDigits: d })
const rows = [
  ['Pobrane obrazy', (r) => String(r.images)],
  ['Obraz główny: plik', (r) => `\`${r.heroUrl}\` (${pl(r.heroKb, 1)} KB)`],
  ['Obraz główny: start pobierania', (r) => `${pl(r.heroStartMs / 1000, 2)} s`],
  ['Obraz główny: koniec pobierania', (r) => `${pl(r.heroEndMs / 1000, 2)} s`],
  ['Obraz główny: priorytet', (r) => r.heroPriority],
  ['Pełne pobranie strony (koniec ostatniego żądania)', (r) => `${pl(r.lastRequestEndMs / 1000, 1)} s`],
]
const md = [
  '',
  '## Szczegóły pobierania obrazów',
  '',
  'Z surowych raportów Lighthouse (`network-requests`), mediana z 5 przebiegów. Skrypt: `scripts/analyze.mjs`.',
  '',
  `| Metryka | ${ids.map((id) => LABELS[id]).join(' | ')} |`,
  `| --- | ${ids.map(() => '---').join(' | ')} |`,
  ...rows.map(([name, f]) => `| ${name} | ${ids.map((id) => f(result[id])).join(' | ')} |`),
  '',
].join('\n')
const report = path.resolve('wyniki/WYNIKI.md')
const current = await readFile(report, 'utf8')
await writeFile(report, current.split('\n## Szczegóły pobierania obrazów')[0].trimEnd() + '\n' + md)
console.log(result)
