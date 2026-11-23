// Tworzy obrazy wersji bazowej (ok. 8 MB) ze zdjęć źródłowych 2400 px.
// Nadal są za duże względem wyświetlanych kafelków, a część to PNG.
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const IN = path.resolve('zrodla-zdjec/img')
const OUT = path.resolve('public-original/img')
await mkdir(OUT, { recursive: true })

const PRODUCT_WIDTH = 800
const HERO_WIDTH = 1600
const JPEG_QUALITY = 88
const HERO_QUALITY = 80

for (const file of await readdir(IN)) {
  const { name } = path.parse(file)
  const input = sharp(path.join(IN, file))

  if (name === 'hero') {
    await input.resize({ width: HERO_WIDTH }).jpeg({ quality: HERO_QUALITY }).toFile(path.join(OUT, 'hero.jpg'))
    continue
  }

  // Zgodnie z src/data/products.ts: co szesnasty produkt to PNG.
  const isPng = Number(name.slice(1)) % 16 === 0
  const resized = input.resize({ width: PRODUCT_WIDTH })
  if (isPng) await resized.png({ compressionLevel: 9 }).toFile(path.join(OUT, `${name}.png`))
  else await resized.jpeg({ quality: JPEG_QUALITY }).toFile(path.join(OUT, `${name}.jpg`))
}

console.log('Gotowe')
