import React from 'react';
import { ExternalLink, Compass } from 'lucide-react';
import { useOnlineCount } from '../services/onlinePresence';

export default function DenisRibbonHeader({ onOpenHelp, onOpenLeaderboard, onOpenAdvertise, currentZoneName }) {
  const onlineCount = useOnlineCount();

  return (
    <header className="h-12 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="https://denischaco.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-tight text-slate-300 hover:text-white transition-colors"
          title="Ir a denischaco.com.ar"
        >
          {/* Logo badge with Denis brand colors */}
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-[#339136] to-[#F48138] p-[1px] shadow-sm">
            <span className="w-full h-full bg-[#0B0F19] rounded-[5px] flex items-center justify-center text-[11px] font-black text-white group-hover:bg-transparent transition-colors">
              D
            </span>
          </span>
          <span className="font-heading font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
            denischaco<span className="text-[#F48138]">.com.ar</span>
          </span>
          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors hidden sm:inline" />
        </a>

        <div className="h-4 w-[1px] bg-slate-800 hidden xs:block" />

        {/* Game Title badge */}
        <span className="hidden xs:flex items-center gap-1 text-xs font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full">
          <Compass className="w-3 h-3 animate-spin-slow" />
          ¿Cuánta Calle Tenés?
        </span>

        {/* Live Active Online Players Badge */}
        <span
          id="online-badge"
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-[11px] font-bold shadow-sm"
          title="Jugadores conectados simultáneamente"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{onlineCount !== null ? `${onlineCount} jugando ahora` : '🟢 En línea'}</span>
        </span>
      </div>

      {/* Zone indicator & Quick actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {currentZoneName && (
          <span className="text-[11px] sm:text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50 max-w-[120px] sm:max-w-none truncate hidden sm:inline">
            📍 {currentZoneName}
          </span>
        )}

        {onOpenAdvertise && (
          <button
            onClick={onOpenAdvertise}
            className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-[#F48138]/20 to-amber-500/20 hover:from-[#F48138]/30 hover:to-amber-500/30 border border-[#F48138]/50 text-[#FFA559] hover:text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            title="Publicitá tu comercio en el mapa"
          >
            <span>📢</span>
            <span className="hidden xs:inline">Sumá tu Local</span>
          </button>
        )}

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            title="¿Cómo se juega?"
            aria-label="Ayuda"
          >
            ?
          </button>
        )}

        {onOpenLeaderboard && (
          <button
            onClick={onOpenLeaderboard}
            className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Ver tabla de posiciones"
          >
            🏆 <span className="hidden sm:inline">Récords</span>
          </button>
        )}
      </div>
    </header>
  );
}
