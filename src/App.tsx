/**
 * @file App.tsx
 * @description Główny układ aplikacji - nagłówek, nawigacja zakładek, przełączniki
 *   trybu pełnoekranowego/minimalistycznego oraz routing widoków gry.
 * @dependencies framer-motion, ./store/useUiStore, ./hooks/useFullscreen, komponenty widoków
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/layout/Header';
import { TabNav } from './components/layout/TabNav';
import { ModeBar } from './components/layout/ModeBar';
import { PlayView } from './components/play/PlayView';
import { LearnView } from './components/learn/LearnView';
import { GalleryView } from './components/gallery/GalleryView';
import { StatsView } from './components/stats/StatsView';
import { PlanView } from './components/plan/PlanView';
import { useUiStore } from './store/useUiStore';
import { useFullscreen } from './hooks/useFullscreen';

export default function App() {
  const activeTab = useUiStore(state => state.activeTab);
  const minimal = useUiStore(state => state.minimal);
  const { isFullscreen, toggle } = useFullscreen();

  const showHero = !minimal && !isFullscreen;

  return (
    <div className={`min-h-screen pb-16 transition-[padding] ${isFullscreen ? 'px-2 pt-2' : 'px-3 sm:px-6'}`}>
      {showHero && <Header />}

      <div className="mx-auto max-w-6xl">
        <div className="sticky top-2 z-20 mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center">
          <TabNav />
          <div className="self-end sm:self-auto">
            <ModeBar isFullscreen={isFullscreen} onToggleFullscreen={toggle} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {activeTab === 'play' && <PlayView isFullscreen={isFullscreen} />}
            {activeTab === 'learn' && <LearnView />}
            {activeTab === 'gallery' && <GalleryView />}
            {activeTab === 'stats' && <StatsView />}
            {activeTab === 'plan' && <PlanView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
