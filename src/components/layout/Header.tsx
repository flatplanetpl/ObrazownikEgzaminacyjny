/**
 * @file Header.tsx
 * @description Kompaktowa sekcja powitalna gry - tytuł i opis. Ukrywana
 *   w trybie minimalistycznym i pełnoekranowym, by oddać miejsce planszy gry.
 * @dependencies framer-motion, ../../data/artworks
 */

import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto mb-3 max-w-6xl px-1 pt-3 sm:mb-4 sm:pt-6"
    >
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent-soft uppercase sm:text-xs sm:tracking-[0.3em]">
        Historia sztuki nowoczesnej · XIX-XXI w.
      </p>
      <h1 className="mt-1.5 text-3xl font-black tracking-tight text-glow sm:text-5xl">
        Obrazownik <span className="text-accent">egzaminacyjny</span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Zobacz dzieło, odpowiedz na pytanie, a gra będzie częściej wracać do pomyłek.
        Tryb skupiony na autorze i tytule.
      </p>
    </motion.header>
  );
}
