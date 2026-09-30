/**
 * Google Analytics 4 (gtag.js) & B2B Telemetry Hub
 * Measurement ID: G-5QEL8C8RBG
 * Handles GA4 events and light Firestore sponsor metrics attribution
 */
import { getFirestoreInstance } from './firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

/**
 * Registra un evento en Google Analytics 4 / Tag Manager si están presentes
 */
const logToGA = (eventName, params = {}) => {
  try {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      const gtagFn =
        typeof window.gtag === 'function'
          ? window.gtag
          : typeof gtag === 'function'
          ? gtag
          : function () {
              window.dataLayer.push(arguments);
            };

      gtagFn('event', eventName, params);
    }
  } catch (err) {
    console.warn('[GA4 Error]:', err);
  }
};

/**
 * Incrementa contadores agregados en Firestore para alimentar métricas B2B de sponsors
 * Sin registrar datos personales, preservando privacidad y bajo costo de lectura/escritura.
 */
const incrementSponsorMetric = async (sponsorId, metricField) => {
  try {
    const db = getFirestoreInstance();
    if (!db || !sponsorId) return;

    const currentMonth = new Date().toISOString().slice(0, 7); // Ej: "2026-09"
    const statsDocRef = doc(db, 'sponsor_stats', `${sponsorId}_${currentMonth}`);

    await setDoc(
      statsDocRef,
      {
        sponsorId,
        month: currentMonth,
        [metricField]: increment(1),
        lastActivity: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    console.warn(`[Analytics] No se pudo incrementar métrica B2B para ${sponsorId}:`, error);
  }
};

/**
 * Detecta si el usuario está ejecutando la aplicación instalada como PWA (modo standalone)
 */
export function isPwaMode() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    (typeof document !== 'undefined' && document.referrer.includes('android-app://'))
  );
}

/**
 * Despachador principal de eventos de la aplicación
 */
export const trackEvent = (eventName, params = {}) => {
  try {
    // Enriquecer automáticamente todos los eventos con el modo de ejecución (pwa o browser)
    const enrichedParams = {
      app_mode: isPwaMode() ? 'pwa' : 'browser',
      ...params
    };

    // 1. Log en consola para entorno de desarrollo
    if (import.meta.env.DEV) {
      console.log(`📡 [Analytics Event]: ${eventName}`, enrichedParams);
    }

    // 2. Registro en GA4
    logToGA(eventName, enrichedParams);

    // 3. Atribución B2B automática según el evento
    if (params.sponsor_id) {
      switch (eventName) {
        case 'coupon_unlocked':
          incrementSponsorMetric(params.sponsor_id, 'impressions_count');
          break;
        case 'coupon_download_voucher':
          incrementSponsorMetric(params.sponsor_id, 'vouchers_downloaded_count');
          break;
        case 'sponsor_maps_navigation':
          incrementSponsorMetric(params.sponsor_id, 'maps_clicks_count');
          break;
        case 'geoboost_game_finished':
          incrementSponsorMetric(params.sponsor_id, 'geoboost_plays_count');
          break;
        default:
          break;
      }
    }
  } catch (err) {
    console.error('[Analytics Error]:', err);
  }
};

/**
 * Evento cuando un jugador inicia una partida
 */
export function trackGameStart(zoneId, zoneName) {
  trackEvent('game_start', {
    zone_id: zoneId,
    zone_name: zoneName
  });
}

/**
 * Evento cuando se abre la ventana de anunciantes/sponsors
 */
export function trackOpenAdvertise(source = 'unknown') {
  trackEvent('open_advertise_modal', {
    source
  });
}

/**
 * Evento cuando un comerciante envía el formulario y va a WhatsApp
 */
export function trackSubmitLead(leadData) {
  trackEvent('generate_lead', {
    plan: leadData.plan || 'desconocido',
    business_name: leadData.businessName,
    category: leadData.category,
    currency: 'ARS'
  });
}

/**
 * Evento cuando se responde una ronda
 */
export function trackRoundAnswer({ roundNumber, mode, isCorrect, scoreDelta, streetName, isExactAddress, multiplier = 1, boostSponsorId = null }) {
  trackEvent('round_answer', {
    round_number: roundNumber,
    mode,
    is_correct: isCorrect,
    score_delta: scoreDelta,
    street_name: streetName,
    is_exact_address: Boolean(isExactAddress),
    multiplier,
    boost_sponsor_id: boostSponsorId
  });
}

/**
 * Evento cuando se completa una partida de 5 calles
 */
export function trackGameComplete({ totalScore, rankTitle, rankBadge, zoneName, geoboostSponsorId = null }) {
  trackEvent('game_complete', {
    score: totalScore,
    rank: rankTitle,
    rank_badge: rankBadge,
    zone: zoneName,
    geoboost_sponsor_id: geoboostSponsorId
  });

  if (geoboostSponsorId) {
    trackEvent('geoboost_game_finished', {
      sponsor_id: geoboostSponsorId,
      final_score: totalScore
    });
  }
}

/**
 * Evento cuando se comparte el resultado
 */
export function trackShareScore({ totalScore, rankTitle }) {
  trackEvent('share', {
    content_type: 'game_score',
    score: totalScore,
    rank: rankTitle
  });
}

/**
 * Evento cuando se guarda el récord en el podio
 */
export function trackSaveScore({ totalScore, zoneName }) {
  trackEvent('save_score', {
    score: totalScore,
    zone: zoneName
  });
}

/**
 * Evento cuando se hace clic en la acción de un auspiciante (ej: Cómo llegar en Google Maps)
 */
export function trackSponsorClick(sponsorName, action = 'view_maps') {
  trackEvent('select_content', {
    content_type: 'sponsor',
    item_id: sponsorName,
    action
  });
}

/**
 * Inicializa escuchas de eventos de instalación y ciclo de vida de la PWA
 */
export function initPwaAnalytics() {
  if (typeof window === 'undefined') return;

  // Registrar sesión inicial indicando si se ejecuta como app instalada o pestaña de navegador
  const isInstalledPwa = isPwaMode();
  logToGA('pwa_session_start', {
    app_mode: isInstalledPwa ? 'pwa' : 'browser',
    display_mode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser_tab'
  });

  // Evento nativo cuando el usuario confirma e instala efectivamente la PWA
  window.addEventListener('appinstalled', () => {
    trackEvent('pwa_installed', {
      method: 'browser_prompt',
      timestamp: new Date().toISOString()
    });
  });

  // Evento cuando el navegador evalúa que el usuario califica para instalar la PWA
  window.addEventListener('beforeinstallprompt', () => {
    trackEvent('pwa_install_prompt_eligible');
  });
}

// Inicialización automática de telemetría PWA al cargar el bundle en cliente
if (typeof window !== 'undefined') {
  initPwaAnalytics();
}

