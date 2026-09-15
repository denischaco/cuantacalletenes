import React from 'react';
import { formatDistance } from '../utils/geoUtils';
import { Award, ArrowRight, BookOpen } from 'lucide-react';

export default function RoundResultModal({
  currentRound,
  totalRounds,
  street,
  distanceMeters,
  pointsEarned,
  onNextRound
}) {
  const isPerfect = distanceMeters <= 60;
  const isClose = distanceMeters <= 300;

  return (
    <div className="absolute inset-0 z-30 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header result badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Ronda {currentRound} / {totalRounds}
          </span>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isPerfect
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isClose
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            {isPerfect ? '🎯 ¡Tiro al blanco!' : isClose ? '🌟 ¡Muy cerca!' : '📍 Ronda completada'}
          </span>
        </div>

        {/* Distance and Points Display */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-center">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Distancia al trazado</p>
            <p className="text-2xl sm:text-3xl font-heading font-black text-white mt-1">
              {formatDistance(distanceMeters)}
            </p>
          </div>
          <div className="border-l border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Puntos sumados</p>
            <p className="text-2xl sm:text-3xl font-heading font-black text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <Award className="w-5 h-5 text-amber-400 inline" />
              <span>+{pointsEarned}</span>
            </p>
          </div>
        </div>

        {/* Street Trivia Card (Learning component) */}
        {street.trivia && (
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

        {/* Action Button */}
        <button
          onClick={onNextRound}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-heading font-bold text-base shadow-xl shadow-cyan-950/40 border border-cyan-400/30 flex items-center justify-center gap-2 transition-transform active:scale-98"
        >
          <span>{currentRound < totalRounds ? 'Siguiente Calle' : 'Ver Resultados Finales'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
