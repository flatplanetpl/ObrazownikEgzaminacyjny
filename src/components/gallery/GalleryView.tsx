/**
 * @file GalleryView.tsx
 * @description Galeria wszystkich dzieł z wyszukiwarką po autorze, tytule, epoce, stylu i roku.
 * @dependencies framer-motion, ../../data/artworks, ../../lib/quiz, ../../store/useUiStore
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ARTWORKS } from '../../data/artworks';
import { normalize } from '../../lib/quiz';
import { useUiStore } from '../../store/useUiStore';

export function GalleryView() {
  const [query, setQuery] = useState('');
  const minimal = useUiStore(state => state.minimal);

  const visible = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return ARTWORKS;
    return ARTWORKS.filter(item => {
      const haystack = normalize([item.artist, item.title, item.year, item.epoka, item.style, item.medium, item.slide].join(' '));
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="glass flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-xl font-extrabold">Galeria dzieł</h2>
          <p className="text-sm text-muted">Przeglądaj wszystkie slajdy. Szukaj po autorze, tytule, epoce, stylu i roku.</p>
        </div>
        <label className="relative w-full sm:w-72">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="np. Goya, secesja, 1937, Guernica"
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pr-4 pl-9 text-sm font-semibold text-ink outline-none focus:border-accent"
          />
        </label>
      </div>

      <p className="text-sm text-muted">
        Widoczne: <strong className="text-ink">{visible.length}</strong> z {ARTWORKS.length} dzieł.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index, 24) * 0.015, ease: 'easeOut' }}
            className="glass flex flex-col overflow-hidden rounded-2xl"
          >
            <div className="grid h-32 place-items-center bg-[#1c1f29] p-2 sm:h-36">
              <img src={item.image} alt={item.title} loading="lazy" className="max-h-full max-w-full rounded-lg object-contain" />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-3">
              <h3 className="text-sm leading-tight font-extrabold">{item.title}</h3>
              <p className="text-xs text-muted">{item.artist}</p>
              <p className="text-xs text-muted">
                {item.year} · slajd {item.slide}
              </p>
              {!minimal && (
                <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-accent-soft">{item.epoka}</span>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-accent-2">{item.style}</span>
                </div>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
