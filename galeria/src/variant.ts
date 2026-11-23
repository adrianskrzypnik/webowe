declare const __TECHNIQUES__: number[]

// Przełączniki technik. Lista technik jest wstawiana podczas budowania z nazwy trybu:
// v0 = bazowa, v1 = T1, v2 = T2, v12 = T1 + T2. Każdą technikę można więc mierzyć
// osobno i w połączeniu z innymi.
export const features = {
  /** Technika 1: WebP/AVIF, srcset, kompresja. */
  modernImages: __TECHNIQUES__.includes(1),
  /** Technika 2: loading="lazy" poniżej pierwszego ekranu, fetchpriority="high" dla obrazu głównego. */
  lazyLoading: __TECHNIQUES__.includes(2),
}
