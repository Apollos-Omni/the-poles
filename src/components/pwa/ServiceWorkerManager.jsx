import { useEffect } from 'react';

const SW_SKIP_KEY = 'sw:skipped';

// Export for manual trigger
export async function tryRegisterNow() {
  console.info('[SW] Registration is temporarily disabled.');
  localStorage.setItem(SW_SKIP_KEY, '1');
  return { ok: false, reason: 'disabled' };
}

export const ServiceWorkerManager = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      localStorage.setItem(SW_SKIP_KEY, '1');
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => {});
    }
  }, []);

  return null;
};

export const PWAInstallManager = () => {
  useEffect(() => {
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
