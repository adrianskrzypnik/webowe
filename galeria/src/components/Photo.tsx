import type { ImgHTMLAttributes } from 'react'
import { features } from '../variant'

/**
 * Kiedy obraz ma się ładować (technika 2):
 * - `priority`: główny obraz (element LCP), pobierany od razu z wysokim priorytetem,
 * - `eager`: widoczny na pierwszym ekranie, pobierany od razu z normalnym priorytetem,
 * - `lazy`: poniżej pierwszego ekranu, pobierany dopiero gdy zbliża się do widoku.
 */
export type PhotoLoading = 'priority' | 'eager' | 'lazy'

interface PhotoProps {
  name: string
  ext: 'jpg' | 'png'
  alt: string
  /** Szerokości wygenerowane przez scripts/optimize-images.mjs. */
  widths: number[]
  sizes: string
  loading?: PhotoLoading
}

const srcSet = (name: string, widths: number[], format: string) =>
  widths.map((w) => `/img/${name}-${w}.${format} ${w}w`).join(', ')

/** Atrybuty techniki 2. W wersjach bez niej obraz nie dostaje żadnych wskazówek. */
function loadingAttributes(loading: PhotoLoading): ImgHTMLAttributes<HTMLImageElement> {
  if (!features.lazyLoading) return {}
  if (loading === 'priority') return { fetchPriority: 'high' }
  if (loading === 'lazy') return { loading: 'lazy', decoding: 'async' }
  return {}
}

export function Photo({ name, ext, alt, widths, sizes, loading = 'lazy' }: PhotoProps) {
  const attributes = loadingAttributes(loading)

  if (!features.modernImages) {
    return <img src={`/img/${name}.${ext}`} alt={alt} {...attributes} />
  }

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(name, widths, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, widths, 'webp')} sizes={sizes} />
      <img
        src={`/img/${name}-${widths[widths.length - 1]}.jpg`}
        srcSet={srcSet(name, widths, 'jpg')}
        sizes={sizes}
        alt={alt}
        {...attributes}
      />
    </picture>
  )
}

export const CARD_WIDTHS = [320, 480, 800]
export const CARD_SIZES = '(min-width: 1100px) 260px, (min-width: 700px) 33vw, 50vw'
export const HERO_WIDTHS = [640, 960, 1280, 1600]
export const DETAIL_SIZES = '(min-width: 900px) 560px, 100vw'
/** Tyle kafelków mieści się na pierwszym ekranie: dwa rzędy na telefonie, jeden rząd na komputerze. */
export const ABOVE_THE_FOLD_CARDS = 4
