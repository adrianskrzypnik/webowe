// Technika 1: generuje AVIF, WebP i JPG w kilku szerokościach z obrazów wersji bazowej.
import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const IN = path.resolve('public-original/img')
const OUT = path.resolve('public-optimized/img')
await mkdir(OUT, { recursive: true })

const CARD_WIDTHS = [320, 480, 800]
const HERO_WIDTHS = [640, 960, 1280, 1600]

const FORMATS = [
  ['avif', (s) => s.avif({ quality: 50, effort: 4 })],
  ['webp', (s) => s.webp({ quality: 72, effort: 5 })],
  ['jpg', (s) => s.jpeg({ quality: 75, mozjpeg: true })],
]

const files = (await readdir(IN)).filter((f) => /\.(jpe?g|png)$/.test(f))
const exists = (file) => stat(file).then(() => true, () => false)

const CONCURRENCY = 4
let cursor = 0

async function worker() {
  while (cursor < files.length) {
    const file = files[cursor++]
    const name = path.parse(file).name
    const widths = name === 'hero' ? HERO_WIDTHS : CARD_WIDTHS
    for (const width of widths) {
      for (const [ext, encode] of FORMATS) {
        const target = path.join(OUT, `${name}-${width}.${ext}`)
        if (await exists(target)) continue
        await encode(sharp(path.join(IN, file)).resize({ width, withoutEnlargement: true })).toFile(target)
      }
    }
    console.log('OK', file)
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))
console.log('Gotowe:', files.length, 'obrazów źródłowych')
