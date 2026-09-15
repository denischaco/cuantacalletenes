import React from 'react';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';

export default function RoundHUD({
  currentRound,
  totalRounds,
  currentStreet,
  score,
  userPin,
  onConfirmGuess
}) {
  if (!currentStreet) return null;

  return (
    <>
      {/* Top Banner: Street to find & Round Status */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-lg pointer-events-auto">
        <div className="glass-panel bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md">
          {/* Round & Score row */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
            <span className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-full border border-slate-700">
              Ronda {currentRound} de {totalRounds}
            </span>
            <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{score.toLocaleString('es-AR')} pts</span>
            </div>
          </div>

          {/* Main Street Callout: Large font for optimal senior readability */}
          <div className="text-center py-1">
            <p className="text-xs sm:text-sm text-cyan-400 font-medium tracking-wide uppercase">
              Ubicá en el mapa:
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-black text-white tracking-tight drop-shadow-md">
              {currentStreet.name}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Tipo: <span className="capitalize text-slate-300 font-semibold">{currentStreet.type}</span>
              {currentStreet.category ? ` • Sector ${currentStreet.category}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-md pointer-events-auto">
        {userPin ? (
          <button
            onClick={onConfirmGuess}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-[#339136] to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-bold text-base sm:text-lg shadow-xl shadow-emerald-950/60 border border-emerald-400/40 flex items-center justify-center gap-2 transform active:scale-98 transition-all animate-bounce-short"
          >
            <MapPin className="w-5 h-5" />
            <span>¡Confirmar Ubicación!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="glass-panel bg-slate-950/90 border border-slate-700/60 py-3 px-4 rounded-2xl text-center shadow-lg">
            <p className="text-xs sm:text-sm font-medium text-slate-300 flex items-center justify-center gap-2">
              <span className="text-lg">👆</span>
              <span>Tocá el mapa donde creés que queda esta calle</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
