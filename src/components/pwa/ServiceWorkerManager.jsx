import { useEffect } from 'react';
import { swIsServeable } from './swHealth';

const SW_SKIP_KEY = "sw:skipped";
const SW_PATH = "/functions/sw";

// Export for manual trigger
export async function tryRegisterNow() {
  console.log("[SW] Manual registration triggered...");
  const ok = await swIsServeable(SW_PATH);
  if (!ok) {
    console.error("[SW] Manual registration failed: Health check did not pass.");
    return { ok: false, reason: 'not-serveable' };
  }
  
  try {
    await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
    console.log("[SW] Manual registration successful.");
    localStorage.removeItem(SW_SKIP_KEY);
    return { ok: true };
  } catch (e) {
    console.error("[SW] Manual registration failed after health check:", e.message);
    return { ok: false, reason: e.message };
  }
}

export const ServiceWorkerManager = () => {
  const registerServiceWorker = async () => {
    const canRegister = await swIsServeable(SW_PATH);
    
    if (!canRegister) {
      localStorage.setItem(SW_SKIP_KEY, "1");
      console.warn(`[SW] Registration skipped as health check failed. Will retry on next load.`);
      return;
    }
    
    if (localStorage.getItem(SW_SKIP_KEY) === "1") {
      console.log("[SW] Routing appears to be fixed—registering now.");
      localStorage.removeItem(SW_SKIP_KEY);
    }

    try {
      const reg = await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
      console.log("[SW] Registration successful:", reg.scope);

      // Listen for updates to the service worker
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        console.log('[SW] Update found. New worker is installing.');
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New worker is waiting to activate.
            // We can prompt the user or just force activation.
            console.log('[SW] New worker installed. Activating immediately.');
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // If a new worker is already waiting, activate it.
      if (reg.waiting) {
        console.log('[SW] A waiting worker was found. Activating immediately.');
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

    } catch (e) {
      console.error("[SW] Registration failed even after a successful health check:", e.message);
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Handle controller changes (background updates)
      const handleControllerChange = () => {
        console.log('[SW] Controller changed - app updated in background');
        // Optional: Show toast notification about update
        // toast.info('App updated. Changes will apply on next page load.');
      };

      window.addEventListener('load', registerServiceWorker);
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
      return () => {
        window.removeEventListener('load', registerServiceWorker);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  return null;
};

export const PWAInstallManager = () => {
  useEffect(() => {
    const manifestUrl = '/functions/manifest.webmanifest';

    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestUrl;
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