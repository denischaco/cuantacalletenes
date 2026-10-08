/**
 * Utility to manage PWA Installation prompt across PC (Chrome/Edge/Brave) and Mobile.
 */

let deferredPrompt = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar on mobile and capture event
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach((listener) => listener(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((listener) => listener(false));
  });
}

export function isInstallPromptAvailable() {
  return Boolean(deferredPrompt);
}

export function subscribeInstallPrompt(callback) {
  listeners.add(callback);
  callback(Boolean(deferredPrompt));
  return () => {
    listeners.delete(callback);
  };
}

export async function promptPwaInstall() {
  if (!deferredPrompt) return false;
  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    listeners.forEach((listener) => listener(false));
    return outcome === 'accepted';
  } catch (err) {
    console.warn('[PWA] Error prompt install:', err);
    return false;
  }
}
