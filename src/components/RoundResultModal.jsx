import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Award, ArrowRight, BookOpen, CheckCircle, XCircle, AlertTriangle, MapPin, ExternalLink, Download, Check, ShieldAlert, Clock } from 'lucide-react';
import { trackSponsorClick, trackEvent } from '../services/analytics';
import { getOrCreateSessionCoupon } from '../utils/couponGenerator';
import { downloadCouponVoucher } from '../utils/voucherCanvas';
import { findNearbySculpture, unlockSculpture } from '../utils/sculptureUtils';
import SculptureUnlockCard from './SculptureUnlockCard';

function renderBadge(badge, name = 'Sponsor', logoBg = '#FFFFFF', className = 'w-full h-full object-contain') {
  if (!badge) return <span className="text-2xl">🍔</span>;
  if (
    typeof badge === 'string' &&
    (badge.startsWith('/') || badge.startsWith('http') || /\.(png|jpe?g|svg|webp|gif)/i.test(badge))
  ) {
    return (
      <div
        style={{ backgroundColor: logoBg }}
        className="w-11 h-11 rounded-xl p-1 border border-[#F48138]/50 shadow-md flex items-center justify-center shrink-0 overflow-hidden"
      >
        <img
          src={badge}
          alt={name}
          className={className}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }
  return <span className="text-2xl">{badge}</span>;
}

export default function RoundResultModal({
  currentRound,
  totalRounds,
  street,
  result,
  onNextRound,
  onOpenCouponModal = null
}) {
  const { isCorrect, isExactAddress, scoreDelta = 0, mode = 'write', userGuess = '', missedAccents = false } = result || {};
  const [copiedCode, setCopiedCode] = useState(false);
  const nextButtonRef = useRef(null);

  // Detección automática de la escultura más cercana a la calle de esta ronda
  const nearbySculpture = useMemo(() => {
    return findNearbySculpture(street, 250);
  }, [street]);

  // Desbloqueo garantizado de la escultura descubierta al revelar la ronda
  const [unlockStatus] = useState(() => {
    if (nearbySculpture) {
      return unlockSculpture(nearbySculpture.catalogId);
    }
    return { isNewUnlock: false };
  });

  // Track coupon unlock event
  useEffect(() => {
    if (street?.isSponsored && street?.sponsor?.id) {
      trackEvent('coupon_unlocked', {
        sponsor_id: street.sponsor.id,
        sponsor_name: street.sponsor.name,
        round_number: currentRound
      });
    }
  }, [street, currentRound]);

  // Cupón persistente de la sesión con ID único y timestamp
  const sessionCoupon = useMemo(() => {
    if (street?.isSponsored && street?.sponsor) {
      return getOrCreateSessionCoupon(street.sponsor);
    }
    return null;
  }, [street]);

  // Auto-focus on button and listen for Enter key to advance immediately
  useEffect(() => {
    // Focus button on mount
    const timer = setTimeout(() => {
      nextButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNextRound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNextRound]);

  return (
    <div className="absolute inset-0 z-[1500] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in pointer-events-auto pb-[env(safe-area-inset-bottom,0px)] overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Header result badge */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            street?.isSponsored
              ? 'bg-amber-500/20 text-[#FFA559] border-[#F48138]/40 font-bold'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {street?.isSponsored ? '⭐ Ronda Especial' : `Ronda ${currentRound} / ${totalRounds}`}
          </span>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              mode === 'timeout'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : isCorrect && mode === 'write' && (scoreDelta === 4 || isExactAddress)
                ? 'bg-amber-500/20 text-[#FFA559] border border-[#F48138]/60 shadow-sm'
                : isCorrect && mode === 'write'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isCorrect
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : missedAccents
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {mode === 'timeout' ? (
              <>
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>⏰ ¡Tiempo Agotado (0 pts)!</span>
              </>
            ) : isCorrect && mode === 'write' && (scoreDelta === 4 || isExactAddress) ? (
              <>
                <Award className="w-3.5 h-3.5 text-[#FFA559]" />
                <span>🎯 ¡Dirección Exacta (+4 pts)!</span>
              </>
            ) : isCorrect && mode === 'write' ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>🎯 ¡Acierto de Calle (+2 pts)!</span>
              </>
            ) : isCorrect ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>🌟 ¡Opción Correcta (+1 pt)!</span>
              </>
            ) : missedAccents ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>⚠️ ¡Faltó el acento / diéresis!</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>❌ ¡Calle Incorrecta!</span>
              </>
            )}
          </span>
        </div>

        {/* Street Name Reveal Card */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
            {street?.isSponsored ? 'Ubicación del comercio:' : 'La calle del punto es:'}
          </p>

          <h3 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight drop-shadow">
            {street?.name}
          </h3>

          <div className="pt-1 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Tu respuesta:</span>
            <span className={`font-semibold px-2 py-0.5 rounded-md ${
              isCorrect ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
            }`}>
              "{userGuess || 'Sin respuesta'}"
            </span>
          </div>

          {/* Points variation banner */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400">Puntaje de la ronda:</span>
            <span className={`text-base sm:text-lg font-heading font-black flex items-center gap-1 ${
              scoreDelta > 0 ? 'text-emerald-400' : scoreDelta < 0 ? 'text-rose-400' : 'text-slate-400'
            }`}>
              <Award className="w-4 h-4 inline" />
              <span>{scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} {Math.abs(scoreDelta) === 1 ? 'pt' : 'pts'}</span>
            </span>
          </div>

          {/* Special feedback for sponsored rounds */}
          {street?.isSponsored && isCorrect && mode === 'write' && (scoreDelta === 4 || isExactAddress) && (
            <p className="text-[11px] text-amber-400 font-semibold pt-1">
              🎉 ¡Extraordinario! Acertaste el nombre y la altura exacta del comercio (+4 pts).
            </p>
          )}
          {street?.isSponsored && isCorrect && mode === 'write' && !(scoreDelta === 4 || isExactAddress) && (
            <p className="text-[11px] text-slate-400 pt-1">
              💡 ¡Gran acierto! Si agregabas el número ({street.number || street.sponsor?.targetStreet?.number || '683'}) sumabas <span className="text-[#FFA559] font-bold">+4 puntos</span>.
            </p>
          )}
        </div>

        {/* Geo-Activated Sponsor Card */}
        {street?.isSponsored && street?.sponsor && (() => {
          const hasActiveCoupon = Boolean(
            street.sponsor.coupon &&
            street.sponsor.hasCoupon !== false &&
            street.sponsor.coupon.active !== false &&
            street.sponsor.coupon.enabled !== false
          );
          const mapsUrl = street.sponsor.coupon?.googleMapsUrl ||
            street.sponsor.googleMapsUrl ||
            (street.sponsor.coordinates ? `https://www.google.com/maps/search/?api=1&query=${street.sponsor.coordinates[0]},${street.sponsor.coordinates[1]}` : null);

          return (
            <div className="bg-gradient-to-br from-[#241105] via-slate-900 to-[#1a0c03] border-2 border-[#F48138] rounded-2xl p-4 shadow-xl text-left space-y-3 relative overflow-hidden animate-scale-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {renderBadge(street.sponsor.badge, street.sponsor.name, street.sponsor.logoBg)}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#FFA559] tracking-wider block">
                      {hasActiveCoupon ? 'Beneficio Exclusivo • ' : 'Comercio Destacado • '}{street.sponsor.name}
                    </span>
                    <h4 className="font-heading font-black text-sm text-white">
                      {hasActiveCoupon
                        ? (street.sponsor.coupon?.title || '15% OFF en tu Consumo')
                        : (street.sponsor.rubro || street.sponsor.name)}
                    </h4>
                  </div>
                </div>
                {hasActiveCoupon ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#F48138]/20 border border-[#F48138]/40 text-[#FFA559] text-[10px] font-bold">
                    Cupón Activo
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
                    Auspiciante Oficial
                  </span>
                )}
              </div>

              {/* Voucher Ticket Visual Card */}
              {hasActiveCoupon && sessionCoupon && (
                <div className="space-y-2.5">
                  <div className="bg-slate-950/90 border-2 border-dashed border-[#F48138]/80 rounded-2xl p-3 text-center space-y-2 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Voucher Digital
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {sessionCoupon.discount}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">Código para el mostrador:</p>
                      <p className="text-lg sm:text-xl font-mono font-black text-amber-400 tracking-wider select-all py-0.5">
                        {sessionCoupon.code}
                      </p>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-amber-500/30 text-[10px] text-amber-300 font-mono mt-1">
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        <span>ID Único: {sessionCoupon.uniqueId}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      {sessionCoupon.instructions}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          trackEvent('coupon_download_voucher', {
                            sponsor_id: street.sponsor.id,
                            sponsor_name: street.sponsor.name,
                            coupon_id: sessionCoupon.uniqueId,
                            discount: sessionCoupon.discount
                          });
                          await downloadCouponVoucher(street.sponsor, sessionCoupon);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2500);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-950/40 transition-all cursor-pointer"
                        title="Descarga la imagen oficial del voucher HD con ID único para mostrarla en el local"
                      >
                        <Download className="w-4 h-4" />
                        <span>{copiedCode ? '¡Voucher Guardado!' : '📸 Guardar Voucher (PNG HD)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          trackEvent('coupon_copy_code', {
                            sponsor_id: street.sponsor.id,
                            coupon_code: sessionCoupon.code
                          });
                          navigator.clipboard.writeText(sessionCoupon.code);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                        title="Copiar solo el código de texto"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                        <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>

                    {onOpenCouponModal && (
                      <button
                        type="button"
                        onClick={() => onOpenCouponModal(street.sponsor)}
                        className="text-[11px] text-[#FFA559] hover:text-amber-200 font-semibold underline block mx-auto pt-1 cursor-pointer"
                      >
                        Ver cupón completo, alcance y condiciones
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Google Maps 'Cómo Llegar' Button */}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSponsorClick(street.sponsor.name, 'round_result_how_to_get')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#F48138]" />
                  <span>Cómo Llegar ({street.sponsor.address || 'Ver en Google Maps'})</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          );
        })()}

        {/* Street Trivia Card (Learning component) */}
        {street?.trivia && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-left flex gap-3 items-start">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-cyan-300">
                Sobre {street.name}:
              </p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {street.trivia}
              </p>
            </div>
          </div>
        )}

        {/* Nearby Sculpture Discovery Card */}
        {nearbySculpture && (
          <SculptureUnlockCard
            sculpture={nearbySculpture}
            isNewUnlock={unlockStatus.isNewUnlock}
          />
        )}

        {/* Action Button: focused by default and triggered on Enter */}
        <button
          ref={nextButtonRef}
          onClick={onNextRound}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-heading font-bold text-base shadow-xl shadow-cyan-950/40 border border-cyan-400/30 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer focus:ring-4 focus:ring-cyan-400/50 outline-none"
        >
          <span>{currentRound < totalRounds ? 'Siguiente Calle' : 'Ver Resultados Finales'}</span>
          <span className="text-xs opacity-75 font-normal px-1.5 py-0.5 rounded bg-white/10 hidden sm:inline">[Enter]</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
