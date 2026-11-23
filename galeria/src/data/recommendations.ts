import type { Product } from './products'

export interface Recommendation {
  source: Product
  match: Product
}

// Parametry dobrane tak, żeby wersja bazowa miała wyraźny TBT. Liczba obliczeń jest stała,
// więc obciążenie jest takie samo w każdym przebiegu i w każdej wersji.
const VECTOR_SIZE = 512
const SHIFTS = 200
const BATCH_SIZE = 12

function featureVector(seed: number): Float64Array {
  const vector = new Float64Array(VECTOR_SIZE)
  let state = seed * 2654435761
  for (let i = 0; i < VECTOR_SIZE; i++) {
    state = (state * 1664525 + 1013904223) % 4294967296
    vector[i] = state / 4294967296 - 0.5
  }
  return vector
}

/** Najlepsze dopasowanie dwóch wektorów po wszystkich przesunięciach. */
function bestCorrelation(a: Float64Array, b: Float64Array): number {
  let best = -Infinity
  for (let shift = 0; shift < SHIFTS; shift++) {
    let sum = 0
    for (let i = 0; i < VECTOR_SIZE; i++) sum += a[i] * b[(i + shift) % VECTOR_SIZE]
    if (sum > best) best = sum
  }
  return best
}

/**
 * Wersja bazowa: rekomendacje liczone na głównym wątku, w kilku długich zadaniach,
 * od razu po starcie strony. Zwraca funkcję anulującą.
 */
export function computeRecommendations(products: Product[], onDone: (result: Recommendation[]) => void): () => void {
  const vectors = products.map((p) => featureVector(p.id))
  const result: Recommendation[] = []
  let index = 0
  let timer = 0

  const runBatch = () => {
    const end = Math.min(index + BATCH_SIZE, products.length)
    for (; index < end; index++) {
      let bestScore = -Infinity
      let match = products[0]
      for (let other = 0; other < products.length; other++) {
        if (other === index) continue
        const score = bestCorrelation(vectors[index], vectors[other])
        if (score > bestScore) {
          bestScore = score
          match = products[other]
        }
      }
      result.push({ source: products[index], match })
    }

    if (index < products.length) timer = window.setTimeout(runBatch, 0)
    else onDone(result)
  }

  // Start po pierwszym malowaniu: długie zadania liczą się do TBT dopiero po FCP.
  const frame = requestAnimationFrame(() => {
    timer = window.setTimeout(runBatch, 0)
  })

  return () => {
    cancelAnimationFrame(frame)
    clearTimeout(timer)
  }
}
