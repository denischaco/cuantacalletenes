import React, { useMemo, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Download,
  Copy,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Users,
  Check,
  Sparkles,
  QrCode as QrIcon
} from 'lucide-react';
import { getOrCreateSessionCoupon, getCanonicalAdminUrl, isSponsorCouponActive } from '../utils/couponGenerator';
import { getLiveSponsorById } from '../utils/streetRandomizer';
import { downloadCouponVoucher } from '../utils/voucherCanvas';
import { trackEvent } from '../services/analytics';

export default function CouponModal({ sponsor, onClose }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Resolver la versión viva más reciente del sponsor
  const liveSponsor = useMemo(() => {
    return getLiveSponsorById(sponsor?.id) || sponsor;
  }, [sponsor]);

  const isCouponActive = useMemo(() => {
    return isSponsorCouponActive(liveSponsor);
  }, [liveSponsor]);

  // Si el cupón fue desactivado mientras el modal estaba abierto, cerrarlo de inmediato
  useEffect(() => {
    if (!isCouponActive && onClose) {
      onClose();
    }
  }, [isCouponActive, onClose]);

  // Obtiene o genera el cupón con ID único para esta sesión
  const couponData = useMemo(() => {
    if (!isCouponActive) return null;
    return getOrCreateSessionCoupon(liveSponsor);
  }, [liveSponsor, isCouponActive]);

  useEffect(() => {
    if (couponData?.uniqueId) {
      const url = getCanonicalAdminUrl(couponData.uniqueId);
      QRCode.toDataURL(url, {
        margin: 1,
        width: 160,
        color: { dark: '#0F172A', light: '#FFFFFF' }
      })
        .then(setQrDataUrl)
        .catch(console.warn);
    }
  }, [couponData]);

  if (!liveSponsor || !couponData || !isCouponActive) return null;

  const handleDownload = async () => {
    setDownloading(true);
    trackEvent('coupon_download_voucher', {
      sponsor_id: liveSponsor.id,
      sponsor_name: liveSponsor.name,
      coupon_id: couponData.uniqueId,
      discount: couponData.discount
    });

    try {
      await downloadCouponVoucher(liveSponsor, couponData);
    } catch (e) {
      console.warn('Error downloading voucher:', e);
    }
    setDownloading(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponData.code);
    trackEvent('coupon_copy_code', {
      sponsor_id: liveSponsor.id,
      coupon_code: couponData.code
    });
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenMaps = () => {
    trackEvent('sponsor_maps_navigation', {
      sponsor_id: liveSponsor.id,
      sponsor_address: liveSponsor.address
    });
    const url =
      liveSponsor.coupon?.googleMapsUrl ||
      liveSponsor.googleMapsUrl ||
      (liveSponsor.coordinates
        ? `https://www.google.com/maps/search/?api=1&query=${liveSponsor.coordinates[0]},${liveSponsor.coordinates[1]}`
        : null);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const isTableScope = couponData.scope === 'table';

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto animate-scale-up">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{ backgroundColor: liveSponsor.logoBg || '#FFFFFF' }}
              className="w-10 h-10 rounded-xl p-1 border border-[#F48138]/50 shadow flex items-center justify-center shrink-0 overflow-hidden"
            >
              {liveSponsor.badge ? (
                <img
                  src={liveSponsor.badge}
                  alt={liveSponsor.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-xl">🎟️</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-black text-base sm:text-lg text-white truncate">
                Cupón de Beneficio Exclusivo
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {liveSponsor.name} • {liveSponsor.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta Destacada de Descuento */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#241105] via-slate-950 to-emerald-950/40 border border-[#F48138]/60 text-center space-y-1 shadow-lg">
          <span className="text-[10px] uppercase tracking-widest font-black text-[#FFA559] flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F48138]" />
            <span>Beneficio Oficial de Calle</span>
          </span>
          <div className="text-3xl sm:text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">
            {couponData.discount}
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-200">
            {couponData.title}
          </p>
        </div>

        {/* Bloque de Verificación de Seguridad con ID Único y QR */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>VALIDACIÓN EN SALÓN:</span>
            </span>
            <span className="font-mono font-black text-white text-xs bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 tracking-wider">
              {couponData.uniqueId}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-slate-800/80">
            {qrDataUrl && (
              <div className="bg-white p-1 rounded-xl shrink-0 shadow-md">
                <img src={qrDataUrl} alt="QR Validación" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
              </div>
            )}
            <div className="space-y-1 text-[11px] text-slate-400 min-w-0 flex-1">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Emitido</span>
                <span className="text-slate-300 font-medium">{couponData.formattedIssuedAt} hs</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-amber-500">Válido hasta</span>
                <span className="text-amber-300 font-bold">{couponData.formattedExpiresAt} hs</span>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-0.5">
                El mozo o cajero puede escanear este QR para validar tu descuento.
              </p>
            </div>
          </div>
        </div>

        {/* Alcance Comercial & Medios de Pago */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isTableScope ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'} shrink-0`}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Alcance del Descuento</span>
              <span className="font-bold text-white text-xs">{couponData.scopeLabel}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <strong className="text-slate-300">Medios de pago admitidos:</strong> {couponData.paymentMethods?.join(', ')}
          </div>
        </div>

        {/* Términos y Condiciones */}
        {couponData.terms && couponData.terms.length > 0 && (
          <div className="space-y-1.5 text-[11px] text-slate-400 px-1">
            <span className="font-bold text-slate-300 uppercase text-[10px] tracking-wider block">
              Condiciones de uso en el local:
            </span>
            <ul className="space-y-1">
              {couponData.terms.map((t, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="space-y-2 pt-1">
          {/* Descargar voucher PNG */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 cursor-pointer transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generando Voucher HD...' : '📸 Guardar Voucher (Imagen PNG)'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Copiar Código */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedCode ? '¡Copiado!' : `Código: ${couponData.code}`}</span>
            </button>

            {/* Cómo Llegar */}
            <button
              type="button"
              onClick={handleOpenMaps}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#F48138]" />
              <span>Cómo Llegar</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-500 pt-1">
          Mostrá este cupón digital o la imagen descargada al mozo o en caja.
        </p>
      </div>
    </div>
  );
}
