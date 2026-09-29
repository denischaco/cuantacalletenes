import React, { useState, useMemo } from 'react';
import landmarksData from '../data/landmarks.json';
import { Play, HelpCircle, MapPin, Heart, Swords, Landmark, Trophy, Zap, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { useOnlineCount } from '../services/onlinePresence';
import { getAlbumStats } from '../utils/sculptureUtils';

export default function StartScreen({
  onStartGame,
  onOpenLeaderboard,
  onOpenHelp,
  onOpenAdvertise,
  onOpenCredits,
  onOpenAlbum,
  onOpenLegal = null,
  activeChallenge = null,
  isLoadingChallenge = false,
  onDismissChallenge = null,
  selectedZoneId: propSelectedZoneId = null,
  onSelectZone = null,
  geoboost = null
}) {
  const [userSelectedZoneId, setUserSelectedZoneId] = useState(null);
  const effectiveZoneId = activeChallenge?.zoneId || userSelectedZoneId || propSelectedZoneId || 'centro';
  const onlineCount = useOnlineCount();
  const albumStats = useMemo(() => getAlbumStats(), []);

  const handleZoneSelect = (zoneId) => {
    setUserSelectedZoneId(zoneId);
    if (onSelectZone) onSelectZone(zoneId);
  };

  const handleStart = () => {
    onStartGame(effectiveZoneId);
  };

  const challengeZone = useMemo(() => {
    if (!activeChallenge?.zoneId) return null;
    return landmarksData.find((z) => z.id === activeChallenge.zoneId) || landmarksData[0];
  }, [activeChallenge]);

  return (
    <div className="absolute inset-0 z-[1500] flex items-center justify-center p-3 sm:p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-slate-950/85 backdrop-blur-md overflow-y-auto pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-5 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Game Title and Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1 group">
            <div className="relative">
              <img
                src="/icons/icon-192.png"
                alt="¿Cuánta Calle Tenés?"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shadow-xl shadow-orange-950/50 ring-2 ring-[#F48138]/40 object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            ¿Cuánta Calle Tenés?
          </h1>
          <p className="text-xs sm:text-sm text-[#F48138] font-semibold">
            El juego de geografía urbana de Resistencia, Chaco
          </p>

          {/* Badges: Online players & Active Boost */}
          <div className="flex items-center justify-center gap-2 pt-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{onlineCount !== null ? `${onlineCount} jugando ahora` : '🟢 En línea'}</span>
            </span>

            {/* Persistent top indicator when player is boosted */}
            {geoboost?.isBoostActive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/90 border border-amber-400 text-amber-300 text-xs font-heading font-black shadow-md shadow-amber-950/60 animate-pulse">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>⚡ ¡BOOST 2X ACTIVO!</span>
              </span>
            )}
          </div>

          {!activeChallenge && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
              Te desafiamos a adivinar <span className="text-white font-bold">5 calles secretas</span> marcadas con un punto sobre un mapa <span className="text-amber-400 font-bold">sin nombres</span>. Escribí el nombre exacto con tildes (<span className="text-emerald-400 font-bold">+2 pts</span>) o elegí entre 4 opciones (<span className="text-amber-400 font-bold">+1 pt</span>).
            </p>
          )}

          {/* Interactive GeoBoost 2x Section (Before starting the game) */}
          <div className="pt-1 max-w-md mx-auto">
            {/* 1. STATE: ACTIVELY BOOSTED */}
            {geoboost?.isBoostActive && geoboost?.boostSponsor && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-yellow-950/60 to-slate-900 border-2 border-amber-400 shadow-xl shadow-amber-950/50 text-left relative overflow-hidden transition-all animate-scale-up">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-[#F48138] text-slate-950 shadow-md shadow-amber-950/60 shrink-0">
                      <Zap className="w-5 h-5 fill-slate-950" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-black text-xs sm:text-sm text-amber-300 tracking-wide uppercase">
                          ¡ESTÁS BOOSTIEADO!
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-sm">
                          2X MULTIPLICADOR
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-amber-200/90 mt-0.5 leading-snug">
                        Detectamos que estás en <strong className="text-white font-bold">{geoboost.boostSponsor.name}</strong> ({geoboost.distanceMeters ? `a ~${geoboost.distanceMeters}m` : 'en el local'}). ¡Tus aciertos sumarán <span className="text-white font-bold">Doble Puntaje (+4 / +2 pts)</span>!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={geoboost.checkProximity}
                    title="Actualizar GPS"
                    className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-white transition-colors shrink-0 cursor-pointer border border-amber-500/40"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. STATE: CHECKING GPS */}
            {geoboost?.geoStatus === 'checking' && (
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-center space-y-1.5 animate-pulse">
                <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Comprobando ubicación GPS...</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Verificando si estás en el radio de 70m de un local auspiciante (Bacanal Burgers o La Fichita).
                </p>
              </div>
            )}

            {/* 3. STATE: OUT OF RANGE */}
            {geoboost?.geoStatus === 'out_of_range' && !geoboost?.isBoostActive && (
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <span className="font-bold text-white block text-xs">Ubicación verificada (Puntaje normal 1x)</span>
                      <span className="text-[11px] text-slate-400">Estás a más de 70m de los locales auspiciantes.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={geoboost.checkProximity}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors border border-slate-700 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reintentar</span>
                  </button>
                </div>
                <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-500">
                  <span>💡 Acercate a French 683 (Bacanal) o Pellegrini 69 (La Fichita) para duplicar.</span>
                </div>
              </div>
            )}

            {/* 4. STATE: PERMISSION DENIED */}
            {geoboost?.geoStatus === 'denied' && !geoboost?.isBoostActive && (
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-amber-900/60 text-left space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">GPS no habilitado en el navegador</span>
                      <span className="text-[11px] text-slate-400">Habilitalo si estás en un comercio amigo.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={geoboost.checkProximity}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[11px] text-amber-300 hover:text-white transition-colors border border-amber-500/40 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reintentar</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. STATE: IDLE / NOT CHECKED YET */}
            {(!geoboost?.geoStatus || geoboost?.geoStatus === 'idle' || geoboost?.geoStatus === 'unavailable') && !geoboost?.isBoostActive && (
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-left space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        Multiplicador GeoBoost 2x
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        Doble Puntaje
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      ¿Estás en un local amigo (ej: <em>Bacanal Burgers</em> o <em>La Fichita</em>)? Habilitá tu ubicación antes de jugar para duplicar tus puntos.
                    </p>
                  </div>
                </div>

                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={geoboost?.checkProximity}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Habilitar Ubicación y Activar 2x</span>
                  </button>
                  <p className="text-[10px] text-slate-400/90 mt-1.5 flex items-center justify-center gap-1 text-center">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Tu ubicación se procesa 100% en tu dispositivo y nunca se guarda en nuestros servidores.</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading state if reading challenge */}
        {isLoadingChallenge && (
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-[#F48138]/50 text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-orange-500/20 text-[#F48138] animate-bounce">
              <Swords className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">Cargando Desafío 1v1...</h3>
            <p className="text-xs text-slate-400">Verificando el circuito de calles de tu rival</p>
          </div>
        )}

        {/* Dedicated 1v1 Challenge Hero Card */}
        {!isLoadingChallenge && activeChallenge && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-orange-950/80 border-2 border-[#F48138] text-center space-y-3.5 shadow-xl shadow-orange-950/40 animate-scale-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-[#FFA559] font-heading font-black text-xs uppercase tracking-wider">
              <Swords className="w-4 h-4 text-[#F48138]" />
              <span>¡Desafío 1v1 Recibido!</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-heading font-black text-white">
                ¡{activeChallenge.creatorName} te desafió!
              </h3>
              <p className="text-xs text-amber-200/90 max-w-sm mx-auto">
                ¿Tenés más calle que tu rival? Ambos compiten adivinando <strong className="text-white font-bold">exactamente las mismas 5 calles</strong>.
              </p>
            </div>

            {/* Challenger Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Rival</span>
                <span className="font-heading font-black text-base text-emerald-400 block">{activeChallenge.creatorScore}/10</span>
                <span className="text-[10px] text-slate-400">puntos</span>
              </div>
              <div className="space-y-0.5 border-x border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tiempo</span>
                <span className="font-heading font-black text-base text-amber-300 block">
                  {activeChallenge.creatorTimeMs ? `${(activeChallenge.creatorTimeMs / 1000).toFixed(1)}s` : '---'}
                </span>
                <span className="text-[10px] text-slate-400">segundos</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Circuito</span>
                <span className="font-heading font-black text-xs text-cyan-300 truncate block mt-0.5">
                  {challengeZone?.shortName || 'Centro'}
                </span>
                <span className="text-[10px] text-slate-400">5 calles</span>
              </div>
            </div>

            {/* Big Accept Button */}
            <button
              onClick={handleStart}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F48138] via-amber-500 to-[#339136] hover:from-amber-500 hover:to-emerald-500 text-white font-heading font-black text-lg sm:text-xl shadow-xl shadow-orange-950/50 border border-amber-300/40 flex items-center justify-center gap-2 transform active:scale-98 transition-all cursor-pointer"
            >
              <Swords className="w-6 h-6 text-white" />
              <span>Aceptar Desafío y Jugar</span>
            </button>

            {/* Dismiss option */}
            {onDismissChallenge && (
              <button
                type="button"
                onClick={onDismissChallenge}
                className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer pt-0.5 block mx-auto transition-colors"
              >
                ¿Preferís jugar en solitario? Salir del desafío
              </button>
            )}
          </div>
        )}

        {/* Regular Zone Selector & Start Button (Only when not in challenge mode) */}
        {!isLoadingChallenge && !activeChallenge && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F48138]" />
                <span>Elegí la Zona o Nivel:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {landmarksData.map((zone) => {
                  const isSelected = zone.id === effectiveZoneId;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneSelect(zone.id)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/50 border-[#F48138] shadow-md shadow-orange-950/40 scale-[1.02]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{zone.badge}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {zone.difficulty}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-sm text-white mt-1">
                        {zone.shortName}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {zone.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Start Button for Solo Play */}
            <button
              onClick={handleStart}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#339136] via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-heading font-black text-lg sm:text-xl shadow-xl shadow-emerald-950/60 border border-emerald-400/40 flex items-center justify-center gap-2 transform active:scale-98 transition-all cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Comenzar Partida (5 Calles)</span>
            </button>
          </>
        )}

        {/* Prominent Hub: Álbum de Esculturas & Ranking Global */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
          {/* Álbum Esculturas Button */}
          <button
            type="button"
            onClick={onOpenAlbum}
            className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 flex items-center gap-2.5 sm:gap-3 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-950/50 cursor-pointer group"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-heading font-black text-xs sm:text-sm text-white block truncate group-hover:text-emerald-300 transition-colors">
                Álbum Esculturas
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  {albumStats.unlockedCount} / {albumStats.total}
                </span>
                <span className="text-[10px] text-slate-400 hidden xs:inline">
                  {albumStats.percent}%
                </span>
              </div>
            </div>
          </button>

          {/* Ranking / Récords Button */}
          <button
            type="button"
            onClick={() => onOpenLeaderboard(effectiveZoneId)}
            className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-[#F48138]/40 hover:border-[#FFA559] flex items-center gap-2.5 sm:gap-3 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-950/50 cursor-pointer group"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-[#F48138]/30 text-amber-400 group-hover:bg-[#F48138] group-hover:text-slate-950 transition-colors shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-heading font-black text-xs sm:text-sm text-white block truncate group-hover:text-amber-300 transition-colors">
                Tabla Récords
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] bg-amber-500/20 text-[#FFA559] border border-[#F48138]/30 px-1.5 py-0.2 rounded-full font-bold">
                  Ranking Top
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Secondary options (Help, Legal & Credits) */}
        <div className="flex items-center justify-center gap-2.5 pt-0.5 text-xs text-slate-400 flex-wrap">
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>¿Cómo jugar?</span>
          </button>
          {onOpenLegal && (
            <>
              <span className="text-slate-700">•</span>
              <button
                onClick={onOpenLegal}
                className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <span>⚖️ Términos & Privacidad</span>
              </button>
            </>
          )}
          {onOpenCredits && (
            <>
              <span className="text-slate-700">•</span>
              <button
                onClick={onOpenCredits}
                className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-emerald-400" />
                <span>Créditos</span>
              </button>
            </>
          )}
        </div>

        {/* Commercial sponsorship invitation */}
        {onOpenAdvertise && (
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={onOpenAdvertise}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#FFA559] hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-[#F48138]/40 px-3 py-1.5 rounded-full transition-all cursor-pointer"
            >
              <span>📢</span>
              <span>¿Tenés un comercio? <strong>Publicitá por los próximos 3 meses</strong></span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
