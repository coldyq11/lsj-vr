# Little Saint James — wersja desktop (bez VR)

Ta sama gra co `index.html` w katalogu głównym, zapakowana w Electron jako zwykła aplikacja Windows (.exe).
Kod gry jest jeden: `build.mjs` kopiuje `index.html`, podmienia CDN na lokalne biblioteki i wyłącza WebXR.
Każda zmiana w `index.html` automatycznie trafia do wersji desktop.

- Pobieranie: zakładka **Releases** → `desktop-latest` (`...-portable.exe` bez instalacji albo `...-setup.exe`).
- GitHub Actions buduje .exe po każdym pushu do `main`, który zmienia `index.html`, `chaser.png` lub `desktop/`.
- Lokalnie: `cd desktop && npm install && npm start` (uruchomienie), `npm run dist:win` (budowa .exe na Windowsie).
- F11 / Alt+Enter — pełny ekran. Zapisy (freegame, ranking) w profilu aplikacji, niezależnie od przeglądarki.
- Multiplayer i czat głosowy działają jak w wersji web (wymagają internetu).
