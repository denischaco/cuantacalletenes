import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  X,
  MapPin,
  Flame,
  Landmark,
  Globe,
  Clock,
  Zap,
  Play
} from 'lucide-react';
import {
  subscribeLeaderboard
} from '../services/firebase';
import sponsorsData from '../data/sponsors.json';

export default function LeaderboardModal({
  onClose,
  initialZoneId = 'centro',
  onSelectZoneAndPlay = null
}) {
  const [scores, setScores] = useState([]);
  const [userZoneTab, setUserZoneTab] = useState(null);
  const activeZoneTab = userZoneTab || (initialZoneId === 'toda_ciudad' ? 'toda_ciudad' : initialZoneId === 'all' ? 'all' : 'centro');
  const [onlyBestPerPlayer, setOnlyBestPerPlayer] = useState(false);

  // Level 3 Sponsors (Tier: sponsor_zona)
  const level3Sponsors = sponsorsData.filter(
    (s) => s.active !== false && (s.plan === 'sponsor_zona' || s.tier === 3 || s.level === 3)
  );

  // Subscribe to real-time updates (Firestore + Local fallback)
  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((updatedScores) => {
      setScores(updatedScores);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Filter helper tolerant with legacy records and normalized zoneIds
  const matchesZone = (item, zoneKey) => {
    if (zoneKey === 'all') return true;
    const zid = item.zoneId || '';
    const zName = (item.zone || '').toLowerCase();

    if (zoneKey === 'centro') {
      return (
        zid === 'centro' ||
        zName.includes('4 avenidas') ||
        zName.includes('centro') ||
        zName.includes('casco') ||
        (!zid && !zName.includes('gran'))
      );
    }

    if (zoneKey === 'toda_ciudad') {
      return (
        zid === 'toda_ciudad' ||
        zName.includes('gran resistencia') ||
        zName.includes('gran') ||
        zName.includes('ciudad')
      );
    }

    return true;
  };

  // Counts per modality
  const counts = useMemo(() => {
    let centroCount = 0;
    let todaCiudadCount = 0;
    for (const s of scores) {
      if (matchesZone(s, 'centro')) centroCount++;
      if (matchesZone(s, 'toda_ciudad')) todaCiudadCount++;
    }
    return {
      centro: centroCount,
      toda_ciudad: todaCiudadCount,
      all: scores.length
    };
  }, [scores]);

  // Filtered and strictly sorted scores (score DESC, time ASC, date DESC)
  const displayScores = useMemo(() => {
    // 1. Filter by active zone tab
    const filtered = scores.filter((item) => matchesZone(item, activeZoneTab));

    // 2. Strict sorting:
    //    - Highest score first
    //    - Speed tiebreaker: lowest totalTimeMs first for identical score
    //    - Date tiebreaker: most recent first
    filtered.sort((a, b) => {
      const scoreA = Number(a.score) || 0;
      const scoreB = Number(b.score) || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      const timeA = a.totalTimeMs && Number(a.totalTimeMs) > 0 ? Number(a.totalTimeMs) : Infinity;
      const timeB = b.totalTimeMs && Number(b.totalTimeMs) > 0 ? Number(b.totalTimeMs) : Infinity;
      if (timeA !== timeB) {
        return timeA - timeB;
      }

      const dateA = a.date || a.createdAt || '';
      const dateB = b.date || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });

    // 3. Optional: Deduplicate by player name if "onlyBestPerPlayer" is toggled
    if (onlyBestPerPlayer) {
      const seen = new Set();
      const uniqueList = [];
      for (const item of filtered) {
        const key = (item.name || 'anónimo').trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueList.push(item);
        }
      }
      return uniqueList;
    }

    return filtered;
  }, [scores, activeZoneTab, onlyBestPerPlayer]);

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5 text-[#F48138]" />
            <h3 className="font-heading font-black text-lg text-white">
              Tabla de Récords
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modalidad Tabs (4 Avenidas vs Gran Resistencia vs Todas) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setUserZoneTab('centro')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeZoneTab === 'centro'
                ? 'bg-gradient-to-r from-[#339136] to-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">4 Avenidas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeZoneTab === 'centro' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {counts.centro}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setUserZoneTab('toda_ciudad')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeZoneTab === 'toda_ciudad'
                ? 'bg-gradient-to-r from-[#F48138] to-[#B95D0E] text-white shadow-md shadow-orange-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Gran Resi</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeZoneTab === 'toda_ciudad' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {counts.toda_ciudad}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setUserZoneTab('all')}
            className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeZoneTab === 'all'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Ver todas las modalidades combinadas"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Todas</span>
          </button>
        </div>

        {/* Sorting notice and Best-per-player toggle */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Desempate por velocidad</span>
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={onlyBestPerPlayer}
              onChange={(e) => setOnlyBestPerPlayer(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-[#F48138] focus:ring-0 cursor-pointer accent-[#F48138]"
            />
            <span>1 por jugador</span>
          </label>
        </div>

        {/* Scores Table / Motivational Empty State */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {displayScores.length === 0 ? (
            activeZoneTab === 'toda_ciudad' ? (
              // Motivational Hero Empty State for Gran Resistencia
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-orange-950/60 via-slate-900 to-amber-950/40 border border-[#F48138]/50 text-center space-y-3 shadow-lg">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/20 border border-[#F48138]/60 flex items-center justify-center text-2xl shadow-inner animate-pulse">
                  🔥
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-sm sm:text-base text-white">
                    ¡El Podio de Gran Resistencia está vacante!
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-200/90 max-w-xs mx-auto leading-relaxed">
                    Nadie completó todavía una partida registrada en el mapa completo de la ciudad. Es la modalidad experta sin límites de avenidas.
                  </p>
                  <p className="text-[11px] text-orange-400 font-semibold pt-0.5">
                    🏆 ¡Sé el primero en jugar y coronate en el puesto #1!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectZoneAndPlay) {
                      onSelectZoneAndPlay('toda_ciudad');
                    } else {
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F48138] to-[#B95D0E] hover:from-[#FFA559] hover:to-[#F48138] text-white font-heading font-black text-xs sm:text-sm shadow-md shadow-orange-950/50 flex items-center justify-center gap-2 transform active:scale-98 transition-all cursor-pointer border border-amber-300/30"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Jugar en Gran Resistencia Ahora</span>
                </button>
              </div>
            ) : (
              // Empty State for 4 Avenidas or All
              <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Aún no hay puntuaciones en esta modalidad.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectZoneAndPlay) {
                      onSelectZoneAndPlay(activeZoneTab === 'all' ? 'centro' : activeZoneTab);
                    } else {
                      onClose();
                    }
                  }}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  ¡Jugá una partida para inaugurar la tabla!
                </button>
              </div>
            )
          ) : (
            displayScores.map((item, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              const hasSpeed = item.totalTimeMs && item.totalTimeMs > 0;
              const seconds = hasSpeed ? (item.totalTimeMs / 1000).toFixed(1) : null;
              const isVeryFast = hasSpeed && item.totalTimeMs < 50000;

              return (
                <div
                  key={item.id || `${item.name}-${idx}`}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-slate-950/90 border-amber-500/50 shadow-sm'
                      : isSecond
                      ? 'bg-slate-950/80 border-slate-700/80'
                      : isThird
                      ? 'bg-slate-950/75 border-amber-900/40'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isFirst
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                          : isSecond
                          ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 shadow-sm ring-1 ring-slate-300'
                          : isThird
                          ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 shadow-sm ring-1 ring-amber-600'
                          : 'bg-slate-800 text-slate-400 font-bold'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="truncate min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {item.name}
                        </p>
                        <span className="text-sm shrink-0" title="Rango Chaqueño">
                          {item.rankBadge}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 truncate">
                        <span className="truncate">
                          {item.zone || (item.zoneId === 'toda_ciudad' ? 'Gran Resistencia' : '4 Avenidas')}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span>{item.date}</span>
                        {hasSpeed && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full font-bold ${
                                isVeryFast
                                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                              title={`Tiempo de resolución total: ${seconds}s`}
                            >
                              {isVeryFast ? <Zap className="w-2.5 h-2.5 text-amber-400 shrink-0" /> : <Clock className="w-2.5 h-2.5 shrink-0" />}
                              <span>{seconds}s</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-heading font-black text-emerald-400">
                        {item.score.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">pts</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Level 3 Sponsors Showcase (Auspiciantes Oficiales de Zona) */}
        {level3Sponsors.length > 0 && (
          <div className="pt-2 border-t border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>⭐</span>
                <span>Auspiciantes Oficiales de Zona</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Nivel 3</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
              {level3Sponsors.map((sp) => (
                <div
                  key={sp.id}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-[#241105] via-slate-900 to-[#180a02] border border-[#F48138]/50 shadow-md flex items-center justify-between gap-2.5 transition-colors hover:border-[#F48138]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      style={{ backgroundColor: sp.logoBg || '#FFFFFF' }}
                      className="w-9 h-9 rounded-xl p-1 border border-[#F48138]/60 shadow-sm flex items-center justify-center shrink-0 overflow-hidden"
                    >
                      {sp.badge ? (
                        <img
                          src={sp.badge}
                          alt={sp.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-lg">⭐</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-black text-xs sm:text-sm text-white truncate">
                          {sp.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {sp.address ? `${sp.address} • ` : ''}{sp.rubro || 'Comercio Destacado'}
                      </p>
                    </div>
                  </div>

                  {(sp.coupon?.googleMapsUrl || sp.googleMapsUrl) && (
                    <a
                      href={sp.coupon?.googleMapsUrl || sp.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-[#F48138]" />
                      <span className="hidden sm:inline">Cómo llegar</span>
                      <span className="sm:hidden">Ver</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Récords sincronizados en tiempo real</span>
          </div>

          <button
            onClick={onClose}
            className="ml-auto py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
