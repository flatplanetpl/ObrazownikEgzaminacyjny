/**
 * @file LearnView.tsx
 * @description Tryb fiszek - obraz dzieła i odwracana karta z odpowiedzią (flip 3D).
 * @dependencies framer-motion, ../../data/artworks, ../../lib/quiz, ../../store/useProgressStore, ../shared/*
 */

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { ARTWORKS, type Artwork } from '../../data/artworks';
import { weightedChoice } from '../../lib/quiz';
import { useProgressStore } from '../../store/useProgressStore';
import { AnswerSheet } from '../shared/AnswerSheet';
import { ImageStage } from '../play/ImageStage';
import { ZoomOverlay } from '../shared/ZoomOverlay';

function pickFlashcard(): Artwork {
  const { getItemProgress } = useProgressStore.getState();
  return weightedChoice(ARTWORKS, candidate => {
    const progress = getItemProgress(candidate.id);
    return 1 + (progress.wrong || 0) * 2 + (5 - (progress.mastery || 0));
  });
}

export function LearnView() {
  const updateProgress = useProgressStore(state => state.updateProgress);

  const [current, setCurrent] = useState<Artwork>(() => pickFlashcard());
  const [revealed, setRevealed] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const pickCard = useCallback(() => {
    setCurrent(pickFlashcard());
    setRevealed(false);
  }, []);

  const mark = (correct: boolean) => {
    updateProgress(current.id, 'flashcard', correct);
    pickCard();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Najpierw zobacz obraz, potem odsłoń komplet: autor, tytuł, rok, epoka, styl i typ dzieła. Zaznacz, czy pamiętasz.
      </p>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <ImageStage item={current} total={ARTWORKS.length} isFullscreen={false} onZoom={() => setZoomSrc(current.image)} />

        <article className="glass-strong flex flex-col gap-4 rounded-3xl p-4 sm:p-6" style={{ perspective: 1200 }}>
          <p className="text-xs font-black tracking-[0.2em] text-accent uppercase">Fiszka · slajd {current.slide}</p>

          <motion.div
            className="relative flex-1"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: revealed ? 180 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="flex min-h-[220px] flex-col gap-4" style={{ backfaceVisibility: 'hidden' }}>
              <h2 className="text-lg font-extrabold sm:text-xl">
                Przypomnij sobie autora, tytuł, epokę i styl. Potem odsłoń odpowiedź.
              </h2>
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-auto w-fit rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-bg shadow-[0_10px_30px_-10px_rgba(255,146,72,0.8)] transition-transform hover:-translate-y-0.5"
              >
                Odsłoń odpowiedź
              </button>
            </div>

            <div
              className="absolute inset-0 flex flex-col gap-4 overflow-y-auto"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {revealed && <AnswerSheet item={current} />}
              <div className="mt-auto flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => mark(false)}
                  className="flex items-center gap-2 rounded-full border border-bad/40 bg-bad/10 px-5 py-2.5 text-sm font-extrabold text-bad transition-colors hover:bg-bad/20"
                >
                  <X size={16} /> Nie pamiętam
                </button>
                <button
                  type="button"
                  onClick={() => mark(true)}
                  className="flex items-center gap-2 rounded-full border border-good/40 bg-good/10 px-5 py-2.5 text-sm font-extrabold text-good transition-colors hover:bg-good/20"
                >
                  <Check size={16} /> Pamiętam
                </button>
              </div>
            </div>
          </motion.div>

          <button
            type="button"
            onClick={pickCard}
            className="w-fit rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-extrabold text-ink/90 transition-colors hover:text-ink"
          >
            Następna
          </button>
        </article>
      </div>

      <ZoomOverlay src={zoomSrc} alt="Powiększenie dzieła" onClose={() => setZoomSrc(null)} />
    </div>
  );
}
