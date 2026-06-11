# Obrazownik egzaminacyjny

Gra (React + Vite + TypeScript) do nauki dzieł z prezentacji **„slajdy_egzamin 2026_Bogusław Deptuła.pdf”**.

## Jak uruchomić

```bash
npm install
npm run dev
```

Otwórz adres pokazany w terminalu (domyślnie `http://localhost:5173`).

### Build produkcyjny

```bash
npm run build
```

Wynik trafia do `dist/` - to statyczne pliki, które można otworzyć/hostować bez backendu (np. `npm run preview`).

## Co jest w zestawie

- 129 dzieł wyciągniętych z kolejnych slajdów PDF.
- Obrazy bez podpisów (`public/images/`).
- Domyślnie pytania o **autora** i **tytuł** (epokę i styl można włączyć w panelu ustawień).
- Fiszki z animacją odwracania (flip) i pełną odpowiedzią: autor, tytuł, rok, epoka, styl, typ dzieła, numer slajdu.
- Galeria z wyszukiwarką, statystyki postępu, eksport/reset postępu.
- Tryb pełnoekranowy (Fullscreen API) i tryb minimalistyczny (mniej elementów dekoracyjnych).
- Zapis postępu w `localStorage` przeglądarki.

## Plan gry

1. Gracz widzi dzieło bez podpisu.
2. Gra losuje pytanie: autor albo tytuł (domyślnie).
3. Gracz wybiera jedną z czterech odpowiedzi (skróty 1-4, Enter = dalej).
4. Po odpowiedzi widzi pełną fiszkę.
5. Błędne albo słabo opanowane dzieła wracają częściej w trybie inteligentnych powtórek.

## Uwaga o klasyfikacji

Pole „epoka” jest uproszczoną ramą chronologiczną do nauki przed egzaminem. Pole „styl” wskazuje dominujący kierunek lub klasyfikację. Część dzieł granicznych może mieć w historii sztuki więcej niż jedną poprawną etykietę, dlatego czasem zastosowano etykiety łączone, np. „symbolizm / ekspresjonizm”.

## Struktura projektu

- `src/data/artworks.ts` - baza dzieł.
- `src/lib/quiz.ts` - logika pytań, dystraktorów i wag powtórek.
- `src/store/` - stan postępu (`useProgressStore`, localStorage) i UI (`useUiStore`).
- `src/components/` - widoki: `play`, `learn`, `gallery`, `stats`, `plan` oraz layout.
- `public/images/` - obrazy wycięte z PDF.
