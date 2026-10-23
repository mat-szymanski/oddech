# Oddech – rzuć palenie (PWA)

Lekka aplikacja PWA wspierająca rzucanie palenia. Czysty HTML/CSS/JS, bez build stepu i bez backendu – wszystkie dane zostają w `localStorage` na telefonie użytkownika.

## Co potrafi

- **Start** – licznik czasu bez papierosa (na żywo), niewypalone papierosy, zaoszczędzone pieniądze, odzyskany czas życia (szac. 20 min/papieros), następny etap regeneracji, cel oszczędzania, wskazówka dopasowana do etapu.
- **Zdrowie** – oś czasu regeneracji organizmu (20 min → 15 lat) z postępem.
- **SOS** – ćwiczenie oddechowe 4-4-6 z animowanym kołem, 3-minutowy licznik, przypomnienie własnego powodu, podpowiedzi „zrób to teraz”, zapis pokonanej zachcianki albo wpadki (bez obwiniania i bez obowiązkowego resetu).
- **Postępy** – 15 odznak, statystyki zachcianek i najczęstsze wyzwalacze.
- **Ja** – powody, cel oszczędzania, edycja danych, motyw jasny/ciemny, telefon do Poradni Pomocy Palącym, eksport/import kopii, reset.
- Działa offline, instaluje się na ekran główny, skrót „SOS” z ikony (Android).

## Uruchomienie lokalnie

```bash
python -m http.server 5173
```

Potem otwórz http://localhost:5173.

## Publikacja (żeby kolega mógł zainstalować na telefonie)

PWA wymaga HTTPS. Najprościej:

- **Netlify Drop** – wejdź na https://app.netlify.com/drop i przeciągnij cały folder.
- **GitHub Pages** – wrzuć pliki do repozytorium i włącz Pages w ustawieniach.
- **Cloudflare Pages / Vercel** – jako statyczna strona, bez komendy build.

Na telefonie: Android/Chrome → „Zainstaluj aplikację”; iPhone/Safari → Udostępnij → „Do ekranu początkowego”.

Po zmianach w plikach podbij `CACHE` w `sw.js` (np. `oddech-v2`).
