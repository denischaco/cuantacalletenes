/**
 * Utility to detect social media In-App Browsers (Instagram, Facebook, TikTok, WhatsApp, etc.),
 * platform (PC / Desktop vs Mobile), and standalone PWA display mode.
 */

export function detectBrowserEnvironment() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isInAppBrowser: false,
      appName: null,
      isStandalone: false,
      isIos: false,
      isAndroid: false,
      isMobile: false,
      isDesktop: true,
      isWindows: false,
      isMac: false
    };
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIos || isAndroid || /Mobi|Tablet|iPad/i.test(ua);
  const isDesktop = !isMobile;
  const isWindows = /Windows/i.test(ua);
  const isMac = /Macintosh|Mac OS X/i.test(ua);

  // Detect standalone PWA display mode
  const isStandalone =
    (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;

  let isInAppBrowser = false;
  let appName = null;

  if (/Instagram/i.test(ua)) {
    isInAppBrowser = true;
    appName = 'Instagram';
  } else if (/FBAN|FBAV/i.test(ua)) {
    isInAppBrowser = true;
    appName = 'Facebook';
  } else if (/TikTok|Bytedance/i.test(ua)) {
    isInAppBrowser = true;
    appName = 'TikTok';
  } else if (/WhatsApp/i.test(ua)) {
    isInAppBrowser = true;
    appName = 'WhatsApp';
  } else if (/Line\//i.test(ua)) {
    isInAppBrowser = true;
    appName = 'Line';
  } else if (/Twitter|X\//i.test(ua)) {
    isInAppBrowser = true;
    appName = 'X (Twitter)';
  }

  return {
    isInAppBrowser,
    appName,
    isStandalone,
    isIos,
    isAndroid,
    isMobile,
    isDesktop,
    isWindows,
    isMac
  };
}
