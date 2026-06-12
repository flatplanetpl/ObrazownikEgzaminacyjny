/**
 * @file PlayView.tsx
 * @description Główny widok gry: panel ustawień, plansza obrazu i panel pytania.
 * @dependencies ../../data/artworks, ./usePlayGame, ./ControlsPanel, ./ImageStage, ./QuizPanel, ../shared/ZoomOverlay
 */

import { useEffect, useState } from 'react';
import { ARTWORKS } from '../../data/artworks';
import { ControlsPanel } from './ControlsPanel';
import { ImageStage } from './ImageStage';
import { QuizPanel } from './QuizPanel';
import { usePlayGame } from './usePlayGame';
import { ZoomOverlay } from '../shared/ZoomOverlay';

interface PlayViewProps {
  isFullscreen: boolean;
}

export function PlayView({ isFullscreen }: PlayViewProps) {
  const game = usePlayGame();
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag && ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;

      if (event.key >= '1' && event.key <= '4' && !game.answered) {
        const option = game.options[Number(event.key) - 1];
        if (option) game.answer(option);
      }
      if (event.key === 'Enter' && (game.answered || game.revealed)) {
        game.chooseQuestion();
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [game]);

  if (!game.pool.length) {
    return (
      <div className="glass-strong rounded-3xl p-8 text-center">
        <h2 className="text-xl font-extrabold">Brak dzieł w wybranym zakresie</h2>
        <p className="mt-2 text-muted">Zmień filtr epoki albo stylu w panelu ustawień.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isFullscreen && <ControlsPanel />}

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <div className="app-sticky-stage sticky z-10 self-start">
          <ImageStage
            item={game.current}
            total={ARTWORKS.length}
            isFullscreen={isFullscreen}
            onZoom={() => setZoomSrc(game.current?.image ?? null)}
          />
        </div>
        <QuizPanel game={game} />
      </div>

      <ZoomOverlay src={zoomSrc} alt="Powiększenie dzieła" onClose={() => setZoomSrc(null)} />
    </div>
  );
}
