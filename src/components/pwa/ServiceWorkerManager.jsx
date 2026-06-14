import { useEffect } from 'react';

const SW_SKIP_KEY = 'sw:skipped';
const SW_URL = '/sw.js';

const isDevelopmentMode = () => {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;

  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);
};

const unregisterExistingServiceWorkers = async () => {
  if (!('serviceWorker' in navigator)) return [];

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  return registrations;
};

// Export for manual trigger
export async function tryRegisterNow() {
  if (!('serviceWorker' in navigator)) {
    return { ok: false, reason: 'unsupported' };
  }

  if (isDevelopmentMode()) {
    console.info('[SW] Registration disabled in development.');
    localStorage.setItem(SW_SKIP_KEY, '1');
    await unregisterExistingServiceWorkers();
    return { ok: false, reason: 'development-disabled' };
  }

  try {
    localStorage.removeItem(SW_SKIP_KEY);
    const registration = await navigator.serviceWorker.register(SW_URL);
    return { ok: true, registration };
  } catch (error) {
    return { ok: false, reason: 'registration-failed', error };
  }
}

export const ServiceWorkerManager = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (isDevelopmentMode()) {
      console.info('[SW] Registration disabled in development.');
      localStorage.setItem(SW_SKIP_KEY, '1');
      unregisterExistingServiceWorkers().catch(() => {});
      return;
    }

    localStorage.removeItem(SW_SKIP_KEY);
    navigator.serviceWorker.register(SW_URL).catch((error) => {
      console.warn('[SW] Registration failed.', error);
    });
  }, []);

  return null;
};

export const PWAInstallManager = () => {
  useEffect(() => {
    if (isDevelopmentMode()) return undefined;

    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.webmanifest';
    document.head.appendChild(manifestLink);

    const themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    themeColorMeta.content = '#8B5CF6';
    document.head.appendChild(themeColorMeta);

    return () => {
      if (document.head.contains(manifestLink)) {
        document.head.removeChild(manifestLink);
      }
      if (document.head.contains(themeColorMeta)) {
        document.head.removeChild(themeColorMeta);
      }
    };
  }, []);

  return null;
};
