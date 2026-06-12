/**
 * @file MobileInstallButton.tsx
 * @description Mobilny przycisk instalacji PWA z instrukcją dla iOS i Androida.
 * @dependencies react, framer-motion, lucide-react
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, PlusCircle, Share2, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type MobilePlatform = 'android' | 'ios' | 'other';
type QueryCleanup = () => void;
type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: () => void) => void;
  removeListener?: (listener: () => void) => void;
};

function detectPlatform(): MobilePlatform {
  const userAgent = navigator.userAgent.toLowerCase();
  const iPadAsDesktop = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  if (userAgent.includes('android')) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent) || iPadAsDesktop) return 'ios';
  return 'other';
}

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function addQueryListener(query: MediaQueryList, listener: () => void): QueryCleanup {
  const legacyQuery = query as LegacyMediaQueryList;

  if (typeof legacyQuery.addEventListener === 'function') {
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }

  legacyQuery.addListener?.(listener);
  return () => legacyQuery.removeListener?.(listener);
}

export function MobileInstallButton() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<MobilePlatform>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const viewportQuery = window.matchMedia('(max-width: 767px)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');

    function matchesMobile() {
      return viewportQuery.matches || pointerQuery.matches;
    }

    function syncDeviceState() {
      setIsMobile(matchesMobile());
      setIsStandalone(isStandaloneMode());
      setPlatform(detectPlatform());
    }

    function handleBeforeInstallPrompt(event: Event) {
      if (!matchesMobile()) return;
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setOpen(false);
    }

    syncDeviceState();
    const removeViewportListener = addQueryListener(viewportQuery, syncDeviceState);
    const removePointerListener = addQueryListener(pointerQuery, syncDeviceState);
    const removeStandaloneListener = addQueryListener(standaloneQuery, syncDeviceState);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      removeViewportListener();
      removePointerListener();
      removeStandaloneListener();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) return;

    const prompt = deferredPrompt;
    setDeferredPrompt(null);
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') {
      setOpen(false);
    }
  }

  if (!isMobile || isStandalone) return null;

  const hasNativeInstall = Boolean(deferredPrompt);
  const title = platform === 'ios' ? 'Dodaj na ekran początkowy' : 'Zainstaluj na telefonie';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass flex h-9 shrink-0 items-center gap-1.5 rounded-2xl px-3 text-xs font-extrabold text-accent-soft transition-colors hover:text-accent sm:hidden"
      >
        <Download size={16} />
        Instalacja
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Zamknij instrukcję instalacji"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm sm:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 28 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="safe-mobile-sheet fixed z-50 rounded-3xl border border-white/12 bg-bg-soft/95 p-4 shadow-[0_24px_90px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black tracking-[0.18em] text-accent uppercase">Mobile</p>
                  <h2 className="mt-1 text-lg font-black">{title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Zamknij"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-ink/80"
                >
                  <X size={18} />
                </button>
              </div>

              {hasNativeInstall && (
                <button
                  type="button"
                  onClick={installApp}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-black text-bg shadow-[0_12px_34px_-12px_rgba(255,146,72,0.85)]"
                >
                  <Smartphone size={18} />
                  Zainstaluj aplikację
                </button>
              )}

              <div className="mt-4 grid gap-2.5 text-sm font-bold text-ink/90">
                {platform === 'ios' ? (
                  <>
                    <div className="flex gap-3 rounded-2xl bg-white/[0.045] p-3">
                      <Share2 size={18} className="mt-0.5 shrink-0 text-accent-soft" />
                      <span>W Safari stuknij ikonę udostępniania.</span>
                    </div>
                    <div className="flex gap-3 rounded-2xl bg-white/[0.045] p-3">
                      <PlusCircle size={18} className="mt-0.5 shrink-0 text-accent-soft" />
                      <span>Wybierz „Dodaj do ekranu początkowego”.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-3 rounded-2xl bg-white/[0.045] p-3">
                      <Download size={18} className="mt-0.5 shrink-0 text-accent-soft" />
                      <span>
                        {hasNativeInstall
                          ? 'Użyj przycisku instalacji powyżej.'
                          : 'W menu przeglądarki wybierz „Zainstaluj aplikację” albo „Dodaj do ekranu głównego”.'}
                      </span>
                    </div>
                    <div className="flex gap-3 rounded-2xl bg-white/[0.045] p-3">
                      <Smartphone size={18} className="mt-0.5 shrink-0 text-accent-soft" />
                      <span>Po dodaniu uruchamiaj Obrazownik ikoną z ekranu telefonu.</span>
                    </div>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
