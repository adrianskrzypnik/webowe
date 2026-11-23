// Pobiera zdjęcia źródłowe. Wersję bazową tworzy z nich scripts/prepare-baseline.mjs.
import { mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const OUT = path.resolve('zrodla-zdjec/img')
const PRODUCTS = 48
await mkdir(OUT, { recursive: true })

const exists = (file) => stat(file).then(() => true, () => false)

async function fetchPhoto(id, w, h) {
  const res = await fetch(`https://picsum.photos/id/${id}/${w}/${h}`)
  if (!res.ok) return null
  return Buffer.from(await res.arrayBuffer())
}

// Część identyfikatorów w serwisie nie istnieje, dlatego idziemy po kolei i pomijamy braki.
let nextId = 10
async function nextPhoto(w, h) {
  for (;;) {
    const id = nextId++
    if (id > 400) throw new Error('Zabrakło zdjęć')
    const data = await fetchPhoto(id, w, h)
    if (data) return { id, data }
  }
}

const sources = []

const hero = await nextPhoto(2400, 1200)
await writeFile(path.join(OUT, 'hero.jpg'), hero.data)
sources.push({ file: 'hero.jpg', picsumId: hero.id })

for (let n = 1; n <= PRODUCTS; n++) {
  const name = `p${String(n).padStart(2, '0')}`
  const isPng = n % 8 === 0
  const file = `${name}.${isPng ? 'png' : 'jpg'}`
  const target = path.join(OUT, file)

  const photo = await nextPhoto(isPng ? 1600 : 2400, isPng ? 1200 : 1800)
  sources.push({ file, picsumId: photo.id })
  if (await exists(target)) continue

  if (isPng) await sharp(photo.data).png({ compressionLevel: 6 }).toFile(target)
  else await writeFile(target, photo.data)
  console.log(file, `id=${photo.id}`)
}

await writeFile(path.resolve('zrodla-zdjec.json'), JSON.stringify(sources, null, 2))
console.log('Gotowe:', sources.length, 'zdjęć')
