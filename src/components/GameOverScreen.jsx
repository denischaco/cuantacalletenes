import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Share2, Check, UserCheck } from 'lucide-react';
import { formatDistance } from '../utils/geoUtils';

export default function GameOverScreen({
  totalScore,
  roundHistory,
  rank,
  zoneName,
  onPlayAgain,
  onSaveScore
}) {
  const [playerName, setPlayerName] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trigger celebratory confetti on screen mount
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!playerName.trim() || saved) return;
    onSaveScore(playerName.trim());
    setSaved(true);
  };

  const handleShare = async () => {
    const text = `¡Hice ${totalScore.toLocaleString('es-AR')} puntos en "¿Cuánta Calle Tenés?" (Resistencia, Chaco)! Rango: ${rank.title} ${rank.badge}. ¿Te animás a superarme?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '¿Cuánta Calle Tenés? - Resistencia, Chaco',
          text,
          url: 'https://denischaco.com.ar'
        });
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto space-y-5 animate-scale-up">
        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 text-2xl shadow-lg shadow-amber-500/20 mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
            ¡Partida Completada!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Zona jugada: <span className="text-slate-200 font-semibold">{zoneName}</span>
          </p>
        </div>

        {/* Assigned Chaco Rank Card */}
        <div className={`p-4 sm:p-5 rounded-2xl border text-center ${rank.bgColor || 'bg-slate-800/80 border-slate-700'}`}>
          <div className="text-3xl mb-1">{rank.badge}</div>
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Tu Rango Chaqueño
          </p>
          <h3 className={`text-xl sm:text-2xl font-heading font-extrabold mt-0.5 ${rank.color || 'text-cyan-400'}`}>
            {rank.title}
          </h3>
          <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
            {rank.description}
          </p>
        </div>

        {/* Total Score Badge */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center">
          <p className="text-xs text-slate-400 uppercase font-semibold">Puntaje Total</p>
          <div className="text-4xl sm:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 mt-1">
            {totalScore.toLocaleString('es-AR')}
            <span className="text-lg text-slate-500 font-normal"> / 5.000</span>
          </div>
        </div>

        {/* Round Breakdown List */}
        <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/80">
          <p className="text-xs font-bold text-slate-400 uppercase px-1 mb-2">
            Detalle de las 5 calles:
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
            {roundHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/70"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-200 truncate">
                    {item.street.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <span className="text-slate-400 text-[11px]">
                    {formatDistance(item.distance)}
                  </span>
                  <span className="font-bold text-emerald-400 w-16">
                    +{item.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save to Leaderboard form */}
        {!saved ? (
          <form onSubmit={handleSave} className="flex gap-2">
            <input
              type="text"
              placeholder="Ingresá tu nombre o apodo..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </form>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>¡Récord guardado en la tabla de posiciones!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleShare}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
          </button>
          <button
            onClick={onPlayAgain}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#339136] to-emerald-600 hover:from-emerald-600 hover:to-teal-500 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jugar de Nuevo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
