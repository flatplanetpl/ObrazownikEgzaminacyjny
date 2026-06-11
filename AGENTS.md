# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Co to jest

Gra przeglądarkowa do nauki przed egzaminem z historii sztuki (na podstawie prezentacji „slajdy_egzamin 2026_Bogusław Deptuła.pdf”), zbudowana jako aplikacja **React + TypeScript + Vite** ze stylami Tailwind CSS v4 i animacjami Framer Motion.

## Komendy

- `npm install` — instalacja zależności.
- `npm run dev` — serwer deweloperski Vite (HMR). Zgodnie z globalną zasadą użytkownika nie uruchamiaj go sam — poproś użytkownika o sprawdzenie w przeglądarce.
- `npm run build` — sprawdzenie typów (`tsc -b`) + build produkcyjny do `dist/`. To jedyna automatyczna weryfikacja poprawności (brak testów jednostkowych).
- `npm run lint` — ESLint.
- `npm run preview` — podgląd builda produkcyjnego.

## Architektura

- **`src/data/artworks.ts`** — `export const ARTWORKS: Artwork[]` (129 obiektów) + interfejs `Artwork` (`id`, `slide`, `artist`, `title`, `year`, `epoka`, `style`, `medium`, `note`, `image`). Pole `epoka` to uproszczona rama chronologiczna, `style` to dominujący kierunek (czasem etykiety łączone, np. „symbolizm / ekspresjonizm”). Ścieżki obrazów wskazują na `public/images/art_NNN.jpg`.
- **`src/types.ts`** — współdzielone typy: `QuestionTypeKey`, `OrderMode`, `TabKey`, `ProgressState`/`ItemProgress`/`FieldProgress`.
- **`src/lib/quiz.ts`** — czysta logika gry (bez zależności od Reacta): `QUESTION_TYPES` (artist/title/epoka/style z `prompt()`/`value()`), `normalize`, `unique`, `shuffle`, `weightedChoice`, `itemWeight` (waga doboru pytania dla trybów smart/random/weak) i `buildOptions` (dobór 3 dystraktorów wg epoki/stylu/medium z fallbackiem do całej puli).
- **`src/store/useProgressStore.ts`** — zustand + `persist` z **niestandardowym adapterem storage**, który zapisuje pod kluczem `obrazownik-egzaminacyjny-v1` dokładnie w kształcie `{items, totalAttempts, totalCorrect}` (zgodność z poprzednią, statyczną wersją gry). Akcje: `getItemProgress`, `getFieldProgress`, `updateProgress(itemId, field, correct)`, `resetProgress`.
- **`src/store/useUiStore.ts`** — stan UI (zustand + `persist` pod kluczem `obrazownik-ui-v1`, partializowany): aktywna zakładka, tryb minimalistyczny, wybrane typy pytań (domyślnie tylko `artist` i `title`), filtry epoki/stylu, tryb kolejności (`smart`/`random`/`weak`).
- **`src/hooks/useFullscreen.ts`** — opakowanie Fullscreen API (`requestFullscreen`/`exitFullscreen` + nasłuch `fullscreenchange`).
- **`src/components/`**:
  - `layout/` — `Header` (hero, ukrywany w trybie minimalnym i fullscreen), `TabNav` (animowany aktywny „pill” przez `layoutId`), `ModeBar` (przełączniki fullscreen/minimal).
  - `play/` — `PlayView` (orkiestracja + skróty klawiszowe 1-4 i Enter), `usePlayGame` (hook z całą logiką sesji gry), `ControlsPanel`, `ImageStage`, `QuizPanel`, `QuizOptions`.
  - `learn/LearnView` — fiszki z animacją flip 3D (przód: pytanie, tył: `AnswerSheet`).
  - `gallery/GalleryView` — wyszukiwarka + siatka ze stagger animacją.
  - `stats/StatsView` — statystyki, lista „najczęściej mylonych”, eksport/reset postępu.
  - `plan/PlanView` — statyczny opis pętli nauki.
  - `shared/` — `AnswerSheet`, `ZoomOverlay` (współdzielone między widokami).
- **`src/App.tsx`** — routing pięciu zakładek (`play`, `learn`, `gallery`, `stats`, `plan`) na podstawie `useUiStore`, z przejściami `AnimatePresence`.
- **`src/index.css`** — Tailwind v4 (`@import "tailwindcss"`) + `@theme` z tokenami koloru (`accent`, `accent-2`, `good`, `bad`, `bg`, `ink`, `muted` itd.) i klasami `glass`/`glass-strong` dla szklanych paneli.

## Konwencje specyficzne dla tego projektu

- Cały interfejs i komentarze są po polsku — nowy tekst UI/dane też powinny być po polsku.
- Nowe pliki `.ts`/`.tsx` mają nagłówek `@file`/`@description`/`@dependencies` (zgodnie z globalną instrukcją użytkownika) — zachowuj ten styl przy kolejnych plikach.
- Logika gry (`src/lib/quiz.ts`) jest niezależna od Reacta i UI — nowe reguły doboru pytań/wag dodawaj tam, a nie w komponentach.
- Przy dodawaniu nowych dzieł do `src/data/artworks.ts` zachowaj dokładnie istniejący zestaw pól, konwencję `id` (`slide-NNN`) oraz numerację plików obrazów w `public/images/` (`art_NNN.jpg`), ścieżka `image` zaczyna się od `/images/...`.
- Zmieniając kształt zapisywanego postępu, pamiętaj o adapterze `rawStorage` w `useProgressStore.ts` — zachowuje on kompatybilność wsteczną zapisu w `localStorage`.
