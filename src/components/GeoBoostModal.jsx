import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Zap,
  MapPin,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Monitor,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { detectBrowserEnvironment } from '../utils/browserDetection';
import { subscribeInstallPrompt, promptPwaInstall } from '../utils/pwaInstall';

export default function GeoBoostModal({ onClose, geoboost }) {
  const browserEnv = useMemo(() => detectBrowserEnvironment(), []);
  const [canPromptInstall, setCanPromptInstall] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    return subscribeInstallPrompt((canPrompt) => {
      setCanPromptInstall(canPrompt);
    });
  }, []);

  const handleInstallClick = async () => {
    const installed = await promptPwaInstall();
    if (installed) {
      setInstallSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base sm:text-lg text-white leading-tight">
                  Multiplicador GeoBoost 2X
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Opcional
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Doble puntaje para el ranking desde comercios adheridos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 overflow-y-auto pr-1 sm:pr-2 max-h-[calc(92vh-140px)]">
          {/* 1. Clarification: NOT required to play or get coupons */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-[#F48138] shrink-0" />
              <span>¿Cómo funciona esta modalidad?</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
              Si estás consumiendo en el salón de cualquiera de nuestros comercios o bares adheridos, podés activar el <strong className="text-amber-300 font-semibold">GeoBoost 2X</strong> para que tus aciertos sumen <strong className="text-white">Doble Puntaje (+4 / +2 pts)</strong> en la tabla de récords.
            </p>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 leading-snug">
              💡 <strong>Jugá tranquilo:</strong> Podés jugar siempre con puntaje normal (1X) desde tu casa o celular. Los cupones de descuento oficiales se desbloquean en la partida sin necesidad de estar en el local.
            </p>
          </div>

          {/* 2. In-App Browser Warning (Instagram / TikTok / Facebook) */}
          {browserEnv.isInAppBrowser && (
            <div className="p-3 rounded-2xl bg-amber-950/50 border-2 border-amber-500/70 text-amber-200 text-xs space-y-2 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Navegador de {browserEnv.appName} detectado</span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-relaxed">
                El visor interno de {browserEnv.appName} suele bloquear el GPS satelital o no permitir ubicación precisa.
              </p>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-amber-500/40 text-[10px] sm:text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-amber-300 block">Para activar el 2X sin errores:</span>
                <span>1. Tocá los <strong>tres puntos (⋮)</strong> o el botón compartir arriba a la derecha.</span>
                <span className="block">2. Elegí <strong>"Abrir en Chrome"</strong> o <strong>"Abrir en Safari"</strong>.</span>
              </div>
            </div>
          )}

          {/* 3. Current Live Status & Diagnostic */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Estado de tu Ubicación:</span>
              </span>
              {geoboost?.isBoostActive ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  2X ACTIVO
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                  Puntaje 1X
                </span>
              )}
            </div>

            {/* A: BOOST ACTIVE */}
            {geoboost?.isBoostActive && geoboost?.boostSponsor && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border border-amber-400/60 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-400 text-slate-950 font-bold shrink-0">
                    <Zap className="w-4 h-4 fill-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                      ¡Estás en el salón!
                    </span>
                    <h4 className="font-heading font-black text-sm text-white">
                      {geoboost.boostSponsor.name}
                    </h4>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300">
                  Tus aciertos en la partida otorgarán <strong>+4 pts</strong> (escrito) y <strong>+2 pts</strong> (opciones).
                </p>
                {geoboost.isMock && (
                  <span className="inline-block px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] border border-blue-500/30">
                    Modo QA Bypass activo vía URL
                  </span>
                )}
              </div>
            )}

            {/* B: CHECKING GPS */}
            {geoboost?.geoStatus === 'checking' && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-center space-y-1.5">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400 mx-auto" />
                <span className="text-xs text-amber-300 font-bold block">Consultando señal de satélite y red...</span>
                <span className="text-[10px] text-slate-400 block">Esto puede demorar hasta 15 segundos bajo techo.</span>
              </div>
            )}

            {/* C: OUT OF RANGE */}
            {geoboost?.geoStatus === 'out_of_range' && !geoboost?.isBoostActive && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">
                    {geoboost?.proximityTier === 'CasiEnElLugar' && '¡Casi en el lugar! (A metros)'}
                    {geoboost?.proximityTier === 'Cerca' && 'Cerca de un local amigo'}
                    {geoboost?.proximityTier === 'MedioCerca' && 'En la zona de un comercio adherido'}
                    {(!geoboost?.proximityTier || geoboost?.proximityTier === 'Lejos') && 'Fuera del área de comercios auspiciantes'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {geoboost?.proximityTier === 'CasiEnElLugar' && geoboost?.nearestSponsor && (
                      <>Estás a pasitos de <strong>{geoboost.nearestSponsor.name}</strong>. Entrá al salón para activar tu 2X.</>
                    )}
                    {geoboost?.proximityTier === 'Cerca' && geoboost?.nearestSponsor && (
                      <>Estás a pocas cuadras de <strong>{geoboost.nearestSponsor.name}</strong> ({geoboost.nearestSponsor.address}).</>
                    )}
                    {geoboost?.proximityTier === 'MedioCerca' && geoboost?.nearestSponsor && (
                      <>Estás en la zona de <strong>{geoboost.nearestSponsor.name}</strong> ({geoboost.nearestSponsor.address}).</>
                    )}
                    {(!geoboost?.proximityTier || geoboost?.proximityTier === 'Lejos') && (
                      <>No detectamos ningún local en tu cercanía inmediata. Tu partida sumará puntaje normal 1X.</>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* D: PERMISSION DENIED (Code 1) */}
            {(geoboost?.geoStatus === 'denied' || geoboost?.geoStatus === 'permission_denied') && !geoboost?.isBoostActive && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/60 text-xs space-y-1">
                <span className="font-bold text-amber-300 block">Permiso GPS no concedido en el navegador</span>
                <span className="text-[11px] text-slate-300 block leading-relaxed">
                  Para activar el multiplicador 2X, tocá el ícono del candado 🔒 en la barra de direcciones de tu navegador y habilitá el permiso de <strong>Ubicación</strong>.
                </span>
              </div>
            )}

            {/* E: TIMEOUT / UNAVAILABLE (Codes 2 & 3) */}
            {(geoboost?.geoStatus === 'timeout' || geoboost?.geoStatus === 'unavailable' || geoboost?.geoStatus === 'position_unavailable') && !geoboost?.isBoostActive && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-900/60 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Demora en la señal o GPS atenuado</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Bajo techo de hormigón/chapa el sensor satelital puede tardar más. 
                  <strong className="text-white block mt-0.5">💡 Consejo: Encendé el Wi-Fi de tu celular (no hace falta conectarte a ninguna red) para que Google/Apple triangulen la posición al instante.</strong>
                </p>
              </div>
            )}

            {/* F: IDLE */}
            {(!geoboost?.geoStatus || geoboost?.geoStatus === 'idle') && !geoboost?.isBoostActive && (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tocá el botón abajo para que el navegador verifique si estás dentro del local y active el multiplicador doble.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => geoboost?.checkProximity(true)}
                disabled={geoboost?.geoStatus === 'checking'}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${geoboost?.geoStatus === 'checking' ? 'animate-spin' : ''}`} />
                <span>{geoboost?.isBoostActive ? 'Actualizar Ubicación' : 'Verificar mi Ubicación (2X)'}</span>
              </button>

              {geoboost?.isBoostActive && (
                <button
                  type="button"
                  onClick={() => geoboost?.resetBoost()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Desactivar modalidad 2X y volver a 1X normal"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desactivar</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Tu posición se evalúa 100% en tu navegador y nunca se guarda en servidores.</span>
            </p>
          </div>

          {/* 4. Multiplatform PWA Installation (PC & Mobile) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instalar el juego en tu PC o Celular</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 shrink-0">
                PC • Android • iOS
              </span>
            </div>

            {browserEnv.isStandalone || installSuccess ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Genial! Ya estás jugando desde la aplicación instalada en modo pantalla completa.</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Podés instalar <strong>¿Cuánta Calle?</strong> en tu computadora o en tu teléfono para jugar en ventana completa, sin barras de navegador y con acceso directo:
                </p>

                {/* 1-Click Install Button if supported by Chrome/Edge/Brave on PC or Android */}
                {canPromptInstall && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600/30 via-teal-600/20 to-emerald-600/30 hover:from-emerald-600/40 hover:to-teal-600/30 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instalar Aplicación en este dispositivo (1 Clic)</span>
                  </button>
                )}

                {/* Multiplatform Instructions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-300 pt-0.5">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                      <Monitor className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>En Computadora (PC / Mac)</span>
                    </div>
                    <p className="text-slate-400 leading-normal">
                      En Chrome, Edge o Brave: hacé clic en el ícono de instalar <strong className="text-slate-200">🖥️ / 📥</strong> en la barra de direcciones o en el menú <strong className="text-slate-200">(⋮) ➔ "Instalar ¿Cuánta Calle?"</strong>.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>En Celular (Android / iPhone)</span>
                    </div>
                    <p className="text-slate-400 leading-normal">
                      {browserEnv.isIos ? (
                        <>En Safari de iPhone: tocá <strong className="text-slate-200">Compartir</strong> (icono cuadrado con flecha) y elegí <strong className="text-slate-200">"Agregar al Inicio"</strong>.</>
                      ) : (
                        <>En Chrome de Android: tocá el menú <strong className="text-slate-200">(⋮)</strong> y elegí <strong className="text-slate-200">"Instalar aplicación"</strong> o "Agregar a la pantalla principal".</>
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-heading font-black text-sm tracking-wide shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Entendido, a Jugar!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
