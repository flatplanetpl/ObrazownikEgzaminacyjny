/**
 * @file AnswerSheet.tsx
 * @description Pełna fiszka z odpowiedzią: autor, tytuł, rok, epoka, styl, typ, slajd, notatka.
 * @dependencies framer-motion, ../../data/artworks
 */

import { motion } from 'framer-motion';
import type { Artwork } from '../../data/artworks';

interface AnswerSheetProps {
  item: Artwork;
}

const ROWS: { label: string; value: (item: Artwork) => string | number }[] = [
  { label: 'Autor', value: item => item.artist },
  { label: 'Tytuł', value: item => item.title },
  { label: 'Rok', value: item => item.year },
  { label: 'Epoka', value: item => item.epoka },
  { label: 'Styl', value: item => item.style },
  { label: 'Typ', value: item => item.medium },
  { label: 'Slajd', value: item => item.slide },
];

export function AnswerSheet({ item }: AnswerSheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass rounded-2xl p-3 sm:p-5"
    >
      <dl className="grid grid-cols-[84px_1fr] gap-x-2 gap-y-2 text-sm sm:grid-cols-[110px_1fr] sm:gap-x-3">
        {ROWS.map(row => (
          <div key={row.label} className="contents">
            <dt className="font-extrabold text-accent-soft">{row.label}</dt>
            <dd className="m-0">{row.value(item)}</dd>
          </div>
        ))}
      </dl>
      {item.note && (
        <div className="mt-3 border-t border-white/10 pt-3 text-sm text-muted">
          <strong className="text-ink">Notatka:</strong> {item.note}
        </div>
      )}
    </motion.div>
  );
}
