/**
 * @file registerServiceWorker.ts
 * @description Rejestruje service workera dla zbudowanej aplikacji, żeby działała offline po pierwszym załadowaniu.
 * @dependencies brak
 */

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline cache jest dodatkiem; aplikacja ma działać nawet bez wsparcia service workera.
    });
  });
}
