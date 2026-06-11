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
      className="mx-auto mb-6 max-w-6xl px-1 pt-6 sm:pt-10"
    >
      <p className="text-xs font-semibold tracking-[0.3em] text-accent-soft uppercase">
        Historia sztuki nowoczesnej · XIX-XXI w.
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-glow sm:text-6xl">
        Obrazownik <span className="text-accent">egzaminacyjny</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
        Zobacz dzieło, odpowiedz na pytanie, a gra będzie częściej wracać do pomyłek.
        Tryb skupiony na autorze i tytule.
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs sm:text-sm">
        <span className="glass rounded-full px-4 py-2 font-semibold">
          <strong className="text-accent">{ARTWORKS.length}</strong> dzieł
        </span>
        <span className="glass rounded-full px-4 py-2 font-semibold">
          Pytania: <strong className="text-accent">autor i tytuł</strong>
        </span>
        <span className="glass rounded-full px-4 py-2 font-semibold">
          <strong className="text-accent">offline</strong> po zbudowaniu
        </span>
      </div>
    </motion.header>
  );
}
