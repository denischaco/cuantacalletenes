import React, { useState, useEffect } from 'react';
import { Trophy, X, Trash2, Award } from 'lucide-react';

const STORAGE_KEY = 'cuanta_calle_leaderboard';

export default function LeaderboardModal({ onClose }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setScores(JSON.parse(stored));
      } else {
        // Default initial demonstration scores to spark competition
        const demoScores = [
          { name: 'Denis G.', score: 4890, rankBadge: '👑', zone: '4 Avenidas', date: '2026-09-14' },
          { name: 'Remisero del Chaco', score: 4620, rankBadge: '👑', zone: 'Toda la Ciudad', date: '2026-09-13' },
          { name: 'Chaqueño106', score: 3840, rankBadge: '🧭', zone: 'Macrocentro', date: '2026-09-12' },
          { name: 'Vecino del Domo', score: 3100, rankBadge: '🚶‍♂️', zone: 'Domo / Río Negro', date: '2026-09-11' }
        ];
        setScores(demoScores);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoScores));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleClear = () => {
    if (confirm('¿Querés borrar el historial local de puntuaciones?')) {
      localStorage.removeItem(STORAGE_KEY);
      setScores([]);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5" />
            <h3 className="font-heading font-black text-lg text-white">
              Tabla de Récords
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scores Table */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {scores.length === 0 ? (
            <p className="text-xs text-center text-slate-500 py-6">
              Aún no hay puntuaciones guardadas. ¡Jugá una tanda para inaugurar la tabla!
            </p>
          ) : (
            scores.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : idx === 1
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                        : idx === 2
                        ? 'bg-amber-800/20 text-amber-600 border border-amber-800/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.name} <span className="text-base">{item.rankBadge}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {item.zone} • {item.date}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-heading font-black text-emerald-400">
                    {item.score.toLocaleString('es-AR')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">pts</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          {scores.length > 0 && (
            <button
              onClick={handleClear}
              className="text-rose-400/80 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar tabla</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
