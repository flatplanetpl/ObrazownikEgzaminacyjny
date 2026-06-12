/**
 * @file ZoomOverlay.tsx
 * @description Pełnoekranowy podgląd powiększonego obrazu dzieła.
 * @dependencies framer-motion, lucide-react
 */

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ZoomOverlayProps {
  src: string | null;
  alt: string;
  onClose: () => void;
}

export function ZoomOverlay({ src, alt, onClose }: ZoomOverlayProps) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="safe-overlay fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            src={src}
            alt={alt}
            onClick={event => event.stopPropagation()}
            className="max-h-full max-w-full cursor-default rounded-2xl object-contain shadow-[0_30px_120px_-30px_rgba(0,0,0,0.9)]"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij powiększenie"
            className="safe-overlay-close fixed flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-11 sm:w-11"
          >
            <X size={22} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
