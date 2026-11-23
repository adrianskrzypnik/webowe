# Wyniki pomiarów

Mediana z 5 przebiegów. Strona główna (`/`) mierzona lokalnie.

## Lighthouse 13.6.0

| Metryka | Bazowa | T1: obrazy | Zmiana | T2: lazy loading | Zmiana | T1 + T2 | Zmiana | Rozrzut bazowej (min–max) | Dobry wynik |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LCP | 10,29 s | 3,82 s | -62,8% | 10,33 s | +0,3% | 3,82 s | -62,9% | 10,28 s – 10,33 s | ≤ 2,5 s |
| FCP | 2,66 s | 2,67 s | +0,6% | 2,67 s | +0,4% | 2,65 s | -0,2% | 2,64 s – 2,68 s | ≤ 1,8 s |
| CLS | 0 | 0 | 0% | 0 | 0% | 0 | 0% | 0 – 0 | ≤ 0,1 |
| TBT | 644 ms | 657 ms | +2,1% | 667 ms | +3,6% | 645 ms | +0,2% | 641 ms – 663 ms | ≤ 200 ms |
| Speed Index | 3,89 s | 2,85 s | -26,7% | 3,90 s | +0,2% | 2,84 s | -27,1% | 3,88 s – 3,91 s | ≤ 3,4 s |
| Rozmiar strony | 7076 KB | 876 KB | -87,6% | 3715 KB | -47,5% | 603 KB | -91,5% | 7076 KB – 7076 KB | im mniej, tym lepiej |
| Rozmiar obrazów | 6842 KB | 641 KB | -90,6% | 3480 KB | -49,1% | 369 KB | -94,6% | 6842 KB – 6842 KB | im mniej, tym lepiej |
| Rozmiar JS (gzip) | 233 KB | 233 KB | +0,0% | 233 KB | +0,0% | 233 KB | +0,0% | 233 KB – 233 KB | im mniej, tym lepiej |
| Liczba żądań HTTP | 52 | 52 | 0,0% | 26 | -50,0% | 26 | -50,0% | 52 – 52 | im mniej, tym lepiej |



### Technika 2 dołożona do techniki 1

| Metryka | T1: obrazy | T1 + T2 | Zmiana |
| --- | --- | --- | --- |
| LCP | 3,82 s | 3,82 s | -0,2% |
| FCP | 2,67 s | 2,65 s | -0,8% |
| CLS | 0 | 0 | 0% |
| TBT | 657 ms | 645 ms | -1,8% |
| Speed Index | 2,85 s | 2,84 s | -0,5% |
| Rozmiar strony | 876 KB | 603 KB | -31,1% |
| Rozmiar obrazów | 641 KB | 369 KB | -42,5% |
| Rozmiar JS (gzip) | 233 KB | 233 KB | +0,0% |
| Liczba żądań HTTP | 52 | 26 | -50,0% |

## rollup-plugin-visualizer

| Metryka | Bazowa | T1: obrazy | T2: lazy loading | T1 + T2 |
| --- | --- | --- | --- | --- |
| Liczba chunków JS | 1 | 1 | 1 | 1 |
| JS w gotowych plikach, gzip (KB) | 232,5 | 232,5 | 232,5 | 232,5 |
| Suma modułów wg visualizera, gzip (KB) | 450,6 | 450,6 | 450,6 | 450,6 |

Suma modułów z visualizera jest liczona przed minifikacją i osobno dla każdego modułu, więc jest wyższa niż realny plik. Do porównań służy wiersz „JS w gotowych plikach”.

## Warunki pomiaru

- Profil mobile Lighthouse: ekran 412×823, DPR 1,75, CPU spowolnione 4×.
- Łącze Slow 4G, RTT 150 ms, 1,6 Mb/s. Lighthouse stosuje przy dławieniu DevTools opóźnienie 562,5 ms i 1474,6 Kb/s pobierania.
- `throttlingMethod: devtools` zamiast domyślnej symulacji, która na tym serwerze dawała niewiarygodne czasy.
- Pusty cache, nowa instancja Chrome w każdym przebiegu.
- Wszystkie wersje po pierwszym renderze liczą rekomendacje na głównym wątku (`src/data/recommendations.ts`), celowo, żeby strona miała mierzalny TBT.
- Serwer lokalny HTTP/1.1 z gzipem (`scripts/serve.mjs`).
- Mediana liczona osobno dla każdej metryki. Surowe raporty są w `wyniki/raw/`, a mapy bundla w `wyniki/bundle/`.

Ostatni pomiar: v0: 2026-11-23T13:40:03.533Z, v1: 2026-11-23T13:42:05.443Z, v2: 2026-11-23T13:45:03.983Z, v12: 2026-11-23T13:46:50.852Z.

## Szczegóły pobierania obrazów

Z surowych raportów Lighthouse (`network-requests`), mediana z 5 przebiegów. Skrypt: `scripts/analyze.mjs`.

| Metryka | Bazowa | T1: obrazy | T2: lazy loading | T1 + T2 |
| --- | --- | --- | --- | --- |
| Pobrane obrazy | 49 | 49 | 23 | 23 |
| Obraz główny: plik | `/img/hero.jpg` (242,8 KB) | `/img/hero-960.avif` (39,5 KB) | `/img/hero.jpg` (242,8 KB) | `/img/hero-960.avif` (39,5 KB) |
| Obraz główny: start pobierania | 2,58 s | 2,60 s | 2,61 s | 2,60 s |
| Obraz główny: koniec pobierania | 10,29 s | 3,81 s | 10,31 s | 3,81 s |
| Obraz główny: priorytet | High | High | High | High |
| Pełne pobranie strony (koniec ostatniego żądania) | 40,5 s | 8,9 s | 22,1 s | 6,0 s |
