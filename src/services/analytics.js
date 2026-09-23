/**
 * Google Analytics 4 (gtag.js) Event Tracking Helper
 * Measurement ID: G-5QEL8C8RBG
 */

export function trackEvent(eventName, params = {}) {
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
      console.log(`[GA4] Evento enviado: "${eventName}"`, params);
    }
  } catch (err) {
    console.warn('[GA4] Error enviando evento:', err);
  }
}

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
 * @param {('header' | 'start_screen' | 'game_over' | 'ribbon')} source - Lugar desde donde se abrió
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
export function trackRoundAnswer({ roundNumber, mode, isCorrect, scoreDelta, streetName, isExactAddress }) {
  trackEvent('round_answer', {
    round_number: roundNumber,
    mode,
    is_correct: isCorrect,
    score_delta: scoreDelta,
    street_name: streetName,
    is_exact_address: Boolean(isExactAddress)
  });
}

/**
 * Evento cuando se completa una partida de 5 calles
 */
export function trackGameComplete({ totalScore, rankTitle, rankBadge, zoneName }) {
  trackEvent('game_complete', {
    score: totalScore,
    rank: rankTitle,
    rank_badge: rankBadge,
    zone: zoneName
  });
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
