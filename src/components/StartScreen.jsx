import React, { useState } from 'react';
import landmarksData from '../data/landmarks.json';
import { Play, Compass, Award, HelpCircle, MapPin } from 'lucide-react';
import { useOnlineCount } from '../services/onlinePresence';

export default function StartScreen({ onStartGame, onOpenLeaderboard, onOpenHelp, onOpenAdvertise }) {
  const [selectedZoneId, setSelectedZoneId] = useState('centro');
  const onlineCount = useOnlineCount();

  const handleStart = () => {
    onStartGame(selectedZoneId);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-slate-950/85 backdrop-blur-md overflow-y-auto pointer-events-auto">
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

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
            Te desafiamos a adivinar <span className="text-white font-bold">5 calles secretas</span> marcadas con un punto sobre un mapa <span className="text-amber-400 font-bold">sin nombres</span>. Escribí el nombre exacto con tildes (<span className="text-emerald-400 font-bold">+2 pts</span>) o elegí entre 4 opciones (<span className="text-amber-400 font-bold">+1 pt</span>).
          </p>
        </div>

        {/* Zone Selector */}
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
                  onClick={() => setSelectedZoneId(zone.id)}
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

        {/* Big Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#339136] via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-heading font-black text-lg sm:text-xl shadow-xl shadow-emerald-950/60 border border-emerald-400/40 flex items-center justify-center gap-2 transform active:scale-98 transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>Comenzar Partida (5 Calles)</span>
        </button>

        {/* Secondary options */}
        <div className="flex items-center justify-center gap-3 pt-1 text-xs">
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Ver Tabla de Récords</span>
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>¿Cómo se juega?</span>
          </button>
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
