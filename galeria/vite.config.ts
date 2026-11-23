import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// Tryb budowania = wersja projektu. Cyfry po „v” to włączone techniki:
// v0 (bazowa), v1 (T1: obrazy), v2 (T2: lazy loading), v12 (T1 + T2).
export default defineConfig(({ mode }) => {
  const match = /^v(\d+)$/.exec(mode)
  const id = match ? `v${match[1]}` : 'v0'
  const techniques = [...(match?.[1] ?? '0')].map(Number).filter((n) => n > 0)

  return {
    define: { __TECHNIQUES__: JSON.stringify(techniques) },
    // Każda wersja dostaje wyłącznie swoje obrazy.
    publicDir: techniques.includes(1) ? 'public-optimized' : 'public-original',
    build: { outDir: `dist/${id}`, emptyOutDir: true },
    plugins: [
      react(),
      visualizer({ filename: `wyniki/bundle/${id}.html`, template: 'treemap', gzipSize: true }),
      visualizer({ filename: `wyniki/bundle/${id}.json`, template: 'raw-data', gzipSize: true }),
    ],
  }
})
