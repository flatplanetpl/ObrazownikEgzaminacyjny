/**
 * @file ImageStage.tsx
 * @description Plansza z obrazem dzieła do rozpoznania, animowana przy zmianie pytania.
 * @dependencies framer-motion, lucide-react, ../../data/artworks
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import type { Artwork } from '../../data/artworks';

interface ImageStageProps {
  item: Artwork | null;
  total: number;
  isFullscreen: boolean;
  onZoom: () => void;
}

export function ImageStage({ item, total, isFullscreen, onZoom }: ImageStageProps) {
  return (
    <article className="glass-strong flex flex-col overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <span className="text-sm font-extrabold tracking-wide text-accent-soft">
          {item ? `Slajd ${item.slide} / ${total + 1}` : 'Dzieło'}
        </span>
        <button
          type="button"
          onClick={onZoom}
          disabled={!item}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-ink/80 transition-colors hover:text-ink disabled:opacity-40"
        >
          <Maximize2 size={14} />
          Powiększ
        </button>
      </div>
      <div
        className={`grid place-items-center bg-[#1c1f29] p-3 sm:p-6 ${
          isFullscreen ? 'min-h-[45vh] sm:min-h-[60vh]' : 'min-h-[240px] sm:min-h-[460px]'
        }`}
      >
        <AnimatePresence mode="wait">
          {item && (
            <motion.img
              key={item.id}
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              src={item.image}
              alt={`Dzieło ze slajdu ${item.slide}`}
              className={`max-w-full rounded-2xl bg-white object-contain shadow-[0_18px_44px_-12px_rgba(0,0,0,0.6)] ${
                isFullscreen ? 'max-h-[55vh] sm:max-h-[70vh]' : 'max-h-[40vh] sm:max-h-[60vh]'
              }`}
            />
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
