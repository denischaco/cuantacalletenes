import React, { useState } from 'react';
import landmarksData from '../data/landmarks.json';
import { Play, Compass, Award, HelpCircle, MapPin } from 'lucide-react';

export default function StartScreen({ onStartGame, onOpenLeaderboard, onOpenHelp }) {
  const [selectedZoneId, setSelectedZoneId] = useState('centro');

  const selectedZone = landmarksData.find(z => z.id === selectedZoneId) || landmarksData[0];

  const handleStart = () => {
    onStartGame(selectedZoneId);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto">
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
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
            Te desafiamos a encontrar <span className="text-white font-bold">5 calles aleatorias</span> sobre un mapa <span className="text-amber-400 font-bold">sin nombres</span>. Orientate por las plazas, avenidas y lagunas chaqueñas.
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
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#339136] via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-heading font-black text-lg sm:text-xl shadow-xl shadow-emerald-950/60 border border-emerald-400/40 flex items-center justify-center gap-2 transform active:scale-98 transition-all"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>Comenzar Partida (5 Calles)</span>
        </button>

        {/* Secondary options */}
        <div className="flex items-center justify-center gap-3 pt-1 text-xs">
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Ver Tabla de Récords</span>
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>¿Cómo se juega?</span>
          </button>
        </div>
      </div>
    </div>
  );
}
