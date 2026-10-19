/**
 * Generador de Cupones con ID Numérico Único y Timestamp
 * Formato estándar: YYMMDD-HHMM-XXXX
 * Ejemplo: 260927-1845-8491
 */

/**
 * Genera un ID de cupón único legible con fechahora y 4 dígitos aleatorios
 */
export function generateUniqueCouponId(_sponsorId = '') {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  // 4 dígitos verificadores aleatorios
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `${yy}${mm}${dd}-${hh}${min}-${randomSuffix}`;
}

import { saveGeneratedCoupon } from '../services/firebase';
import { getLiveSponsorById } from './streetRandomizer';

/**
 * Valida de forma estricta si un sponsor y su beneficio digital están actualmente habilitados para emisión.
 * Siempre consulta el estado vivo en memoria / Firestore para garantizar fidelidad 100%.
 */
export function isSponsorCouponActive(sponsor) {
  if (!sponsor) return false;
  const live = getLiveSponsorById(sponsor.id) || sponsor;
  return Boolean(
    live &&
    live.active !== false &&
    live.hasCoupon !== false &&
    live.coupon &&
    live.coupon.active !== false &&
    live.coupon.enabled !== false
  );
}

/**
 * Invalida y elimina cualquier cupón emitido en la sesión para el sponsor dado.
 */
export function clearSessionCoupon(sponsorId) {
  if (!sponsorId || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(`cct_coupon_${sponsorId}`);
  } catch (e) {}
}

/**
 * Obtiene la URL canónica del panel de canje para el cupón.
 * Fuerza siempre https://cuantacalletenes.ar (salvo en entorno de desarrollo local).
 */
export function getCanonicalAdminUrl(uniqueId) {
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const baseDomain = isLocal ? window.location.origin : 'https://cuantacalletenes.ar';
  return `${baseDomain}/admin?redeem=${uniqueId}`;
}

export function getOrCreateSessionCoupon(sponsor) {
  if (!sponsor) return null;

  // Resolver la versión viva más reciente del sponsor
  const liveSponsor = getLiveSponsorById(sponsor.id) || sponsor;
  const storageKey = `cct_coupon_${liveSponsor.id}`;

  // Si el sponsor está deshabilitado o su promoción fue desactivada, limpiar de inmediato y no emitir
  if (!isSponsorCouponActive(liveSponsor)) {
    clearSessionCoupon(liveSponsor.id);
    return null;
  }

  if (typeof sessionStorage !== 'undefined') {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        // Garantizar que siempre use cuantacalletenes.ar y no dominios anteriores (ej: denischaco.com.ar)
        parsed.redeemUrl = getCanonicalAdminUrl(parsed.uniqueId);
        return parsed;
      } catch {
        // Si falla, se regenera
      }
    }
  }

  const issuedAt = new Date();
  const validityHours = liveSponsor.coupon?.validityHours || 48; // 48 horas por defecto
  const expiresAt = new Date(issuedAt.getTime() + validityHours * 60 * 60 * 1000);
  const uniqueId = generateUniqueCouponId(liveSponsor.id);

  // Deep Link canónico para validación directa en salón
  const redeemUrl = getCanonicalAdminUrl(uniqueId);

  const newCouponData = {
    uniqueId,
    redeemUrl,
    sponsorId: liveSponsor.id,
    sponsorName: liveSponsor.name,
    discount: liveSponsor.coupon?.discount || '15% OFF',
    code: liveSponsor.coupon?.code || 'CALLE-DESCUENTO',
    title: liveSponsor.coupon?.title || 'Cupón Oficial de Descuento',
    scope: liveSponsor.coupon?.scope || 'individual',
    scopeLabel: liveSponsor.coupon?.scopeLabel || 'Por persona / Comensal individual',
    paymentMethods: liveSponsor.coupon?.paymentMethods || ['Efectivo', 'Transferencia'],
    terms: liveSponsor.coupon?.terms || [
      'Presentar la captura con ID único y fecha/hora legible en caja.',
      'No acumulable con otras promociones vigentes.'
    ],
    instructions: liveSponsor.coupon?.instructions || 'Mostrá esta pantalla o captura con tu ID único en caja.',
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    formattedIssuedAt: issuedAt.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    formattedExpiresAt: expiresAt.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  // Guardar en Firestore para que el local pueda validarlo
  saveGeneratedCoupon(newCouponData).catch((err) => {
    console.warn('Notice saving coupon to Firestore:', err);
  });

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(newCouponData));
    } catch (e) {
      console.warn('Error saving coupon to sessionStorage:', e);
    }
  }

  return newCouponData;
}
