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

/**
 * Obtiene o crea un cupón persistente para la sesión actual del usuario
 */
export function getOrCreateSessionCoupon(sponsor) {
  if (!sponsor) return null;

  const storageKey = `cct_coupon_${sponsor.id}`;
  if (typeof sessionStorage !== 'undefined') {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) {
      try {
        return JSON.parse(existing);
      } catch {
        // Si falla, se regenera
      }
    }
  }

  const issuedAt = new Date();
  const validityHours = sponsor.coupon?.validityHours || 48; // 48 horas por defecto
  const expiresAt = new Date(issuedAt.getTime() + validityHours * 60 * 60 * 1000);

  const newCouponData = {
    uniqueId: generateUniqueCouponId(sponsor.id),
    sponsorId: sponsor.id,
    sponsorName: sponsor.name,
    discount: sponsor.coupon?.discount || '15% OFF',
    code: sponsor.coupon?.code || 'CALLE-DESCUENTO',
    title: sponsor.coupon?.title || 'Cupón Oficial de Descuento',
    scope: sponsor.coupon?.scope || 'individual',
    scopeLabel: sponsor.coupon?.scopeLabel || 'Por persona / Comensal individual',
    paymentMethods: sponsor.coupon?.paymentMethods || ['Efectivo', 'Transferencia'],
    terms: sponsor.coupon?.terms || [
      'Presentar la captura con ID único y fecha/hora legible en caja.',
      'No acumulable con otras promociones vigentes.'
    ],
    instructions: sponsor.coupon?.instructions || 'Mostrá esta pantalla o captura con tu ID único en caja.',
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

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(newCouponData));
    } catch (e) {
      console.warn('Error saving coupon to sessionStorage:', e);
    }
  }

  return newCouponData;
}
