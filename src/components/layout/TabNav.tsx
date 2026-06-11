/**
 * @file TabNav.tsx
 * @description Pasek zakładek widoków gry z animowanym aktywnym wskaźnikiem.
 * @dependencies framer-motion, ../../store/useUiStore, ../../types
 */

import { motion } from 'framer-motion';
import type { TabKey } from '../../types';
import { useUiStore } from '../../store/useUiStore';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'play', label: 'Gra' },
  { key: 'learn', label: 'Fiszki' },
  { key: 'gallery', label: 'Galeria' },
  { key: 'stats', label: 'Postęp' },
  { key: 'plan', label: 'Plan gry' },
];

export function TabNav() {
  const activeTab = useUiStore(state => state.activeTab);
  const setActiveTab = useUiStore(state => state.setActiveTab);

  return (
    <nav
      aria-label="Widoki gry"
      className="glass scrollbar-thin flex flex-1 gap-1 overflow-x-auto rounded-full p-1.5"
    >
      {TABS.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
              isActive ? 'text-bg' : 'text-ink/80 hover:text-ink'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-accent shadow-[0_8px_24px_-6px_rgba(255,146,72,0.7)]"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
