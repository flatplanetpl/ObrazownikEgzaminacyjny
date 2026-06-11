/**
 * @file ModeBar.tsx
 * @description Przełączniki trybu pełnoekranowego i minimalistycznego.
 * @dependencies lucide-react, ../../store/useUiStore, ../../hooks/useFullscreen
 */

import { Eye, EyeOff, Maximize, Minimize } from 'lucide-react';
import { useUiStore } from '../../store/useUiStore';

interface ModeBarProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function ModeBar({ isFullscreen, onToggleFullscreen }: ModeBarProps) {
  const minimal = useUiStore(state => state.minimal);
  const toggleMinimal = useUiStore(state => state.toggleMinimal);

  return (
    <div className="glass flex shrink-0 gap-1 rounded-2xl p-1">
      <button
        type="button"
        onClick={toggleMinimal}
        title={minimal ? 'Wyłącz tryb minimalistyczny' : 'Włącz tryb minimalistyczny'}
        aria-pressed={minimal}
        className={`flex items-center justify-center rounded-xl p-1.5 transition-colors sm:p-2 ${
          minimal ? 'bg-accent text-bg' : 'text-ink/80 hover:text-ink'
        }`}
      >
        {minimal ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
      <button
        type="button"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}
        aria-pressed={isFullscreen}
        className="flex items-center justify-center rounded-xl p-1.5 text-ink/80 transition-colors hover:text-ink sm:p-2"
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>
    </div>
  );
}
