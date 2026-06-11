/**
 * @file Header.tsx
 * @description Sekcja powitalna gry - tytuł, opis i szybkie statystyki. Ukrywana
 *   w trybie minimalistycznym i pełnoekranowym, by oddać miejsce planszy gry.
 * @dependencies framer-motion, ../../data/artworks
 */

import { motion } from 'framer-motion';
import { ARTWORKS } from '../../data/artworks';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto mb-4 max-w-6xl px-1 pt-4 sm:mb-6 sm:pt-10"
    >
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent-soft uppercase sm:text-xs sm:tracking-[0.3em]">
        Historia sztuki nowoczesnej · XIX-XXI w.
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-glow sm:text-5xl lg:text-6xl">
        Obrazownik <span className="text-accent">egzaminacyjny</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
        Zobacz dzieło, odpowiedz na pytanie, a gra będzie częściej wracać do pomyłek.
        Tryb skupiony na autorze i tytule.
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5 text-xs sm:mt-5 sm:gap-2 sm:text-sm">
        <span className="glass rounded-full px-3 py-1.5 font-semibold sm:px-4 sm:py-2">
          <strong className="text-accent">{ARTWORKS.length}</strong> dzieł
        </span>
        <span className="glass rounded-full px-3 py-1.5 font-semibold sm:px-4 sm:py-2">
          Pytania: <strong className="text-accent">autor i tytuł</strong>
        </span>
        <span className="glass rounded-full px-3 py-1.5 font-semibold sm:px-4 sm:py-2">
          <strong className="text-accent">offline</strong> po zbudowaniu
        </span>
      </div>
    </motion.header>
  );
}
