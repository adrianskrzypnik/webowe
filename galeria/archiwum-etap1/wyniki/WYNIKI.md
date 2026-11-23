# Wyniki pomiarów

Mediana z 5 przebiegów. Strona główna (`/`) mierzona lokalnie.

## Lighthouse 13.6.0

| Metryka | Bazowa | T1: obrazy | Zmiana | Rozrzut bazowej (min–max) | Dobry wynik |
| --- | --- | --- | --- | --- | --- |
| LCP | 10,29 s | 3,82 s | -62,9% | 10,28 s – 10,31 s | ≤ 2,5 s |
| FCP | 2,65 s | 2,67 s | +0,8% | 2,63 s – 2,66 s | ≤ 1,8 s |
| CLS | 0 | 0 | 0% | 0 – 0 | ≤ 0,1 |
| TBT | 630 ms | 632 ms | +0,3% | 627 ms – 631 ms | ≤ 200 ms |
| Speed Index | 3,90 s | 2,85 s | -26,9% | 3,88 s – 3,92 s | ≤ 3,4 s |
| Rozmiar strony | 7076 KB | 876 KB | -87,6% | 7076 KB – 7076 KB | im mniej, tym lepiej |
| Rozmiar obrazów | 6842 KB | 641 KB | -90,6% | 6842 KB – 6842 KB | im mniej, tym lepiej |
| Rozmiar JS (gzip) | 233 KB | 233 KB | 0,0% | 233 KB – 233 KB | im mniej, tym lepiej |
| Liczba żądań HTTP | 52 | 52 | 0,0% | 52 – 52 | im mniej, tym lepiej |



## rollup-plugin-visualizer

| Metryka | Bazowa | T1: obrazy |
| --- | --- | --- |
| Liczba chunków JS | 1 | 1 |
| JS w gotowych plikach, gzip (KB) | 232,3 | 232,3 |
| Suma modułów wg visualizera, gzip (KB) | 450,4 | 450,4 |

Suma modułów z visualizera jest liczona przed minifikacją i osobno dla każdego modułu, więc jest wyższa niż realny plik. Do porównań służy wiersz „JS w gotowych plikach”.

## Warunki pomiaru

- Profil mobile Lighthouse: ekran 412×823, DPR 1,75, CPU spowolnione 4×.
- Łącze Slow 4G, RTT 150 ms, 1,6 Mb/s. Lighthouse stosuje przy dławieniu DevTools opóźnienie 562,5 ms i 1474,6 Kb/s pobierania.
- `throttlingMethod: devtools` zamiast domyślnej symulacji, która na tym serwerze dawała niewiarygodne czasy.
- Pusty cache, nowa instancja Chrome w każdym przebiegu.
- Obie wersje po pierwszym renderze liczą rekomendacje na głównym wątku (`src/data/recommendations.ts`), celowo, żeby strona miała mierzalny TBT.
- Serwer lokalny HTTP/1.1 z gzipem (`scripts/serve.mjs`).
- Mediana liczona osobno dla każdej metryki. Surowe raporty są w `wyniki/raw/`, a mapy bundla w `wyniki/bundle/`.

Ostatni pomiar: v0: 2026-11-09T16:22:47.062Z, v1: 2026-11-09T16:24:48.576Z.
