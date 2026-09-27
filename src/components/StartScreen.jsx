import React, { useState, useMemo } from 'react';
import landmarksData from '../data/landmarks.json';
import { Play, Compass, HelpCircle, MapPin, Heart, Swords, Landmark, Trophy } from 'lucide-react';
import { useOnlineCount } from '../services/onlinePresence';
import { getAlbumStats } from '../utils/sculptureUtils';

export default function StartScreen({
  onStartGame,
  onOpenLeaderboard,
  onOpenHelp,
  onOpenAdvertise,
  onOpenCredits,
  onOpenAlbum,
  activeChallenge = null,
  isLoadingChallenge = false,
  onDismissChallenge = null,
  selectedZoneId: propSelectedZoneId = null,
  onSelectZone = null
}) {
  const [selectedZoneId, setSelectedZoneId] = useState(activeChallenge?.zoneId || propSelectedZoneId || 'centro');
  const onlineCount = useOnlineCount();
  const albumStats = useMemo(() => getAlbumStats(), []);

  React.useEffect(() => {
    if (propSelectedZoneId && !activeChallenge) {
      setSelectedZoneId(propSelectedZoneId);
    }
  }, [propSelectedZoneId, activeChallenge]);

  const effectiveZoneId = activeChallenge?.zoneId || selectedZoneId;

  const handleZoneSelect = (zoneId) => {
    setSelectedZoneId(zoneId);
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
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-[#F48138]/20 border border-cyan-500/30 text-cyan-400 mb-1">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            ¿Cuánta Calle Tenés?
          </h1>
          <p className="text-xs sm:text-sm text-cyan-300 font-semibold">
            El juego de geografía urbana de Resistencia, Chaco
          </p>

          {/* Online active players badge */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{onlineCount !== null ? `${onlineCount} jugando ahora` : '🟢 En línea'}</span>
            </span>
          </div>

          {!activeChallenge && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
              Te desafiamos a adivinar <span className="text-white font-bold">5 calles secretas</span> marcadas con un punto sobre un mapa <span className="text-amber-400 font-bold">sin nombres</span>. Escribí el nombre exacto con tildes (<span className="text-emerald-400 font-bold">+2 pts</span>) o elegí entre 4 opciones (<span className="text-amber-400 font-bold">+1 pt</span>).
            </p>
          )}
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
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Elegí la Zona o Nivel:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {landmarksData.map((zone) => {
                  const isSelected = zone.id === selectedZoneId;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneSelect(zone.id)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-950/70 to-slate-900 border-cyan-500/80 shadow-md shadow-cyan-950/50 scale-[1.02]'
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

        {/* Secondary options (Help & Credits) */}
        <div className="flex items-center justify-center gap-3 pt-0.5 text-xs text-slate-400">
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>¿Cómo jugar?</span>
          </button>
          {onOpenCredits && (
            <>
              <span className="text-slate-700">•</span>
              <button
                onClick={onOpenCredits}
                className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-800 cursor-pointer"
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
              <span>¿Tenés un comercio en Resistencia? <strong>Publicitá acá</strong></span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
