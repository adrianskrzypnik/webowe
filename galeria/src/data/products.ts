import moment from 'moment'

export type Category = 'Krajobraz' | 'Miasto' | 'Natura' | 'Detal'

export interface Product {
  id: number
  name: string
  image: string
  ext: 'jpg' | 'png'
  category: Category
  price: number
  addedAt: string
}

const FIRST = ['Poranna', 'Cicha', 'Daleka', 'Złota', 'Chłodna', 'Ukryta']
const SECOND = ['droga', 'przystań', 'dolina', 'godzina', 'zatoka', 'granica', 'linia', 'polana']
const CATEGORIES: Category[] = ['Krajobraz', 'Miasto', 'Natura', 'Detal']

export const PRODUCT_COUNT = 48

export const products: Product[] = Array.from({ length: PRODUCT_COUNT }, (_, i) => {
  const number = i + 1
  return {
    id: number,
    name: `${FIRST[i % FIRST.length]} ${SECOND[Math.floor(i / FIRST.length) % SECOND.length]}`,
    image: `p${String(number).padStart(2, '0')}`,
    // Co szesnaste zdjęcie jest w PNG, jak w źle przygotowanym katalogu.
    ext: number % 16 === 0 ? 'png' : 'jpg',
    category: CATEGORIES[i % CATEGORIES.length],
    price: 89 + ((i * 37) % 260),
    addedAt: moment('2026-10-01').subtract(i * 3, 'days').format('YYYY-MM-DD'),
  }
})
