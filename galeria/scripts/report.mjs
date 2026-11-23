// Składa wyniki wersji w tabelę „wersja × metryka × narzędzie” ze zmianą względem wersji bazowej.
import { readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'

const VARIANTS = [
  ['v0', 'Bazowa'],
  ['v1', 'T1: obrazy'],
  ['v2', 'T2: lazy loading'],
  ['v12', 'T1 + T2'],
]

const METRICS = [
  ['lcpMs', 'LCP', 's', '≤ 2,5 s'],
  ['fcpMs', 'FCP', 's', '≤ 1,8 s'],
  ['cls', 'CLS', '', '≤ 0,1'],
  ['tbtMs', 'TBT', 'ms', '≤ 200 ms'],
  ['speedIndexMs', 'Speed Index', 's', '≤ 3,4 s'],
  ['pageKb', 'Rozmiar strony', 'KB', 'im mniej, tym lepiej'],
  ['imagesKb', 'Rozmiar obrazów', 'KB', 'im mniej, tym lepiej'],
  ['jsKb', 'Rozmiar JS (gzip)', 'KB', 'im mniej, tym lepiej'],
  ['requests', 'Liczba żądań HTTP', '', 'im mniej, tym lepiej'],
]

const pl = (n, digits) => n.toLocaleString('pl-PL', { minimumFractionDigits: digits, maximumFractionDigits: digits })

function format(value, unit) {
  if (unit === 's') return `${pl(value / 1000, 2)} s`
  if (unit === 'ms') return `${pl(value, 0)} ms`
  if (unit === 'KB') return `${pl(value, 0)} KB`
  return Number.isInteger(value) ? String(value) : pl(value, 3)
}

function change(value, base) {
  if (base === 0) return value === 0 ? '0%' : 'n/d'
  const pct = ((value - base) / base) * 100
  return `${pct > 0 ? '+' : ''}${pl(pct, 1)}%`
}

const loaded = []
for (const [id, label] of VARIANTS) {
  const file = path.resolve(`wyniki/${id}.json`)
  if (await stat(file).then(() => true, () => false)) {
    loaded.push({ id, label, data: JSON.parse(await readFile(file, 'utf8')) })
  }
}

// TBT zależy od szybkości CPU, więc liczymy je tylko z przebiegów, w których indeks wydajności
// Lighthouse nie spadł o więcej niż 10% względem najlepszego przebiegu wszystkich wersji.
for (const v of loaded) {
  v.benchmarks = []
  for (let run = 1; run <= v.data.runs.length; run++) {
    const raw = JSON.parse(await readFile(path.resolve(`wyniki/raw/${v.id}/run-${run}.json`), 'utf8'))
    v.benchmarks.push(raw.environment.benchmarkIndex)
  }
}
const bestBenchmark = Math.max(...loaded.flatMap((v) => v.benchmarks))
const tbtNotes = []
for (const v of loaded) {
  const valid = v.data.runs.filter((_, i) => v.benchmarks[i] >= bestBenchmark * 0.9).map((r) => r.tbtMs).sort((a, b) => a - b)
  if (valid.length === 0) throw new Error(`${v.id}: brak przebiegów przy normalnej wydajności CPU`)
  if (valid.length === v.data.runs.length) continue
  const mid = valid.length / 2
  const median = valid.length % 2 ? valid[Math.floor(mid)] : (valid[mid - 1] + valid[mid]) / 2
  v.data.summary.tbtMs = { median, min: valid[0], max: valid.at(-1) }
  tbtNotes.push(
    `- **${v.label}: TBT policzone tylko z ${valid.length} z ${v.data.runs.length} przebiegów.** W pozostałych indeks wydajności CPU spadł z ok. ${Math.round(bestBenchmark)} do ok. ${Math.round(Math.min(...v.benchmarks))}, a TBT wzrosło do ok. ${Math.round(Math.max(...v.data.runs.map((r) => r.tbtMs)))} ms. Pozostałe metryki nie zmieniły się w tych przebiegach w widoczny sposób.`,
  )
}

const base = loaded[0]
const headers = ['Metryka', ...loaded.flatMap((v, i) => (i === 0 ? [v.label] : [v.label, 'Zmiana'])), 'Rozrzut bazowej (min–max)', 'Dobry wynik']

const rows = METRICS.map(([key, name, unit, good]) => {
  const cells = [name]
  loaded.forEach((v, i) => {
    const value = v.data.summary[key].median
    cells.push(format(value, unit))
    if (i > 0) cells.push(change(value, base.data.summary[key].median))
  })
  const { min, max } = base.data.summary[key]
  cells.push(`${format(min, unit)} – ${format(max, unit)}`, good)
  return cells
})

// Wpływ techniki 2 na wersję, która ma już technikę 1 (T1 + T2 względem T1).
const byId = Object.fromEntries(loaded.map((v) => [v.id, v]))
const stackRows =
  byId.v1 && byId.v12
    ? METRICS.map(([key, name, unit]) => {
        const a = byId.v1.data.summary[key].median
        const b = byId.v12.data.summary[key].median
        return [name, format(a, unit), format(b, unit), change(b, a)]
      })
    : []

const table = (head, body) =>
  [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...body.map((r) => `| ${r.join(' | ')} |`)].join('\n')

const bundleRows = [
  ['Liczba chunków JS', ...loaded.map((v) => String(v.data.visualizer.chunks))],
  ['JS w gotowych plikach, gzip (KB)', ...loaded.map((v) => pl(v.data.visualizer.builtJsGzipKb, 1))],
  ['Suma modułów wg visualizera, gzip (KB)', ...loaded.map((v) => pl(v.data.visualizer.modulesGzipKb, 1))],
]

const md = `# Wyniki pomiarów

Mediana z 5 przebiegów. Strona główna (\`/\`) mierzona lokalnie.

## Lighthouse ${base.data.lighthouseVersion}

${table(headers, rows)}

${tbtNotes.join('\n')}

${stackRows.length ? `### Technika 2 dołożona do techniki 1\n\n${table(['Metryka', 'T1: obrazy', 'T1 + T2', 'Zmiana'], stackRows)}\n` : ''}
## rollup-plugin-visualizer

${table(['Metryka', ...loaded.map((v) => v.label)], bundleRows)}

Suma modułów z visualizera jest liczona przed minifikacją i osobno dla każdego modułu, więc jest wyższa niż realny plik. Do porównań służy wiersz „JS w gotowych plikach”.

## Warunki pomiaru

- Profil mobile Lighthouse: ekran 412×823, DPR 1,75, CPU spowolnione 4×.
- Łącze Slow 4G, RTT 150 ms, 1,6 Mb/s. Lighthouse stosuje przy dławieniu DevTools opóźnienie 562,5 ms i 1474,6 Kb/s pobierania.
- \`throttlingMethod: devtools\` zamiast domyślnej symulacji, która na tym serwerze dawała niewiarygodne czasy.
- Pusty cache, nowa instancja Chrome w każdym przebiegu.
- Wszystkie wersje po pierwszym renderze liczą rekomendacje na głównym wątku (\`src/data/recommendations.ts\`), celowo, żeby strona miała mierzalny TBT.
- Serwer lokalny HTTP/1.1 z gzipem (\`scripts/serve.mjs\`).
- Mediana liczona osobno dla każdej metryki. Surowe raporty są w \`wyniki/raw/\`, a mapy bundla w \`wyniki/bundle/\`.

Ostatni pomiar: ${loaded.map((v) => `${v.id}: ${v.data.measuredAt}`).join(', ')}.
`

const csvHead = 'wersja,narzedzie,metryka,mediana,min,max,jednostka'
const unitName = { lcpMs: 'ms', fcpMs: 'ms', cls: '', tbtMs: 'ms', speedIndexMs: 'ms', pageKb: 'KB', imagesKb: 'KB', jsKb: 'KB', requests: '' }
const csv = [csvHead]
for (const v of loaded) {
  for (const [key] of METRICS) {
    const s = v.data.summary[key]
    csv.push([v.id, 'lighthouse', key, s.median, s.min, s.max, unitName[key]].join(','))
  }
  csv.push([v.id, 'visualizer', 'builtJsGzipKb', v.data.visualizer.builtJsGzipKb, '', '', 'KB'].join(','))
  csv.push([v.id, 'visualizer', 'chunks', v.data.visualizer.chunks, '', '', ''].join(','))
}

await writeFile(path.resolve('wyniki/WYNIKI.md'), md)
await writeFile(path.resolve('wyniki/wyniki.csv'), csv.join('\n') + '\n')
console.log(md)
