/**
 * @file registerServiceWorker.ts
 * @description Rejestruje service workera dla zbudowanej aplikacji, żeby działała offline po pierwszym załadowaniu.
 * @dependencies brak
 */

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const wasControlled = Boolean(navigator.serviceWorker.controller);
    let reloading = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!wasControlled || reloading) return;

      reloading = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then(registration => {
        function activateWaitingWorker(worker: ServiceWorker | null) {
          worker?.postMessage({ type: 'SKIP_WAITING' });
        }

        activateWaitingWorker(registration.waiting);

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              activateWaitingWorker(worker);
            }
          });
        });

        registration.update().catch(() => {
          // Aktualizacja cache jest dodatkiem; aplikacja ma działać nawet bez tego sprawdzenia.
        });
      })
      .catch(() => {
        // Offline cache jest dodatkiem; aplikacja ma działać nawet bez wsparcia service workera.
      });
  });
}
