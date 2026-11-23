# Wyniki pomiarów

Mediana z 5 przebiegów. Strona główna (`/`) mierzona lokalnie.

## Lighthouse 13.6.0

| Metryka | Bazowa | T1: obrazy | Zmiana | Rozrzut bazowej (min–max) | Dobry wynik |
| --- | --- | --- | --- | --- | --- |
| LCP | 16,06 s | 3,79 s | -76,4% | 16,04 s – 16,07 s | ≤ 2,5 s |
| FCP | 2,66 s | 2,65 s | -0,3% | 2,63 s – 2,67 s | ≤ 1,8 s |
| CLS | 0 | 0 | 0% | 0 – 0 | ≤ 0,1 |
| TBT | 637 ms | 636 ms | -0,2% | 634 ms – 641 ms | ≤ 200 ms |
| Speed Index | 3,55 s | 2,82 s | -20,5% | 3,50 s – 3,64 s | ≤ 3,4 s |
| Rozmiar strony | 39 114 KB | 859 KB | -97,8% | 39 114 KB – 39 114 KB | im mniej, tym lepiej |
| Rozmiar obrazów | 38 879 KB | 625 KB | -98,4% | 38 879 KB – 38 879 KB | im mniej, tym lepiej |
| Rozmiar JS (gzip) | 233 KB | 233 KB | 0,0% | 233 KB – 233 KB | im mniej, tym lepiej |
| Liczba żądań HTTP | 52 | 52 | 0,0% | 52 – 52 | im mniej, tym lepiej |

- **Bazowa: TBT policzone tylko z 2 z 5 przebiegów.** W pozostałych indeks wydajności CPU spadł z ok. 3281 do ok. 2080, a TBT wzrosło do ok. 1665 ms. Pozostałe metryki nie zmieniły się w tych przebiegach w widoczny sposób.

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

Ostatni pomiar: v0: 2026-11-09T13:39:22.772Z, v1: 2026-11-09T13:19:08.697Z.
