import React from 'react';
import { ExternalLink, Compass, Heart } from 'lucide-react';
import { useOnlineCount } from '../services/onlinePresence';

export default function DenisRibbonHeader({ onOpenHelp, onOpenLeaderboard, onOpenAdvertise, onOpenCredits, currentZoneName }) {
  const onlineCount = useOnlineCount();

  return (
    <header className="h-12 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Project Identity: Compass Isotype & Online Counter */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Protagonist: Compass Isotype + Game Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-[#F48138]/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950/40">
            <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin-slow" />
          </div>
          <span className="font-heading font-black text-xs sm:text-sm text-white tracking-tight">
            <span className="hidden xs:inline">¿Cuánta Calle Tenés?</span>
            <span className="xs:hidden">¿Cuánta Calle?</span>
          </span>
        </div>

        {/* Live Active Online Players Badge */}
        <span
          id="online-badge"
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-[11px] font-bold shadow-sm shrink-0"
          title="Jugadores conectados simultáneamente"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{onlineCount !== null ? `${onlineCount} jugando` : '🟢 En línea'}</span>
        </span>

        {/* Enlace discreto a la web personal mediante pill "By @denischaco" */}
        <a
          href="https://denischaco.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shrink-0"
          title="Desarrollado por Denis Gómez (denischaco.com.ar)"
        >
          <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">By</span>
          <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">@denischaco</span>
          <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </a>
      </div>

      {/* Zone indicator & Quick actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Discrete "By @denischaco" on extra small screens */}
        <a
          href="https://denischaco.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="sm:hidden inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-800 transition-all cursor-pointer group"
          title="Desarrollado por Denis Gómez (denischaco.com.ar)"
        >
          <span className="text-slate-500 group-hover:text-emerald-400">By</span>
          <span className="font-semibold text-slate-300 group-hover:text-white">@denischaco</span>
        </a>

        {currentZoneName && (
          <span className="text-[11px] sm:text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50 max-w-[120px] sm:max-w-none truncate hidden lg:inline">
            📍 {currentZoneName}
          </span>
        )}

        {onOpenAdvertise && (
          <button
            onClick={onOpenAdvertise}
            className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#F48138]/20 to-amber-500/20 hover:from-[#F48138]/30 hover:to-amber-500/30 border border-[#F48138]/50 text-[#FFA559] hover:text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            title="Publicitá tu comercio en el mapa"
          >
            <span>📢</span>
            <span className="hidden sm:inline">Sumá tu Local</span>
          </button>
        )}

        {onOpenCredits && (
          <button
            onClick={onOpenCredits}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
            title="Créditos & Agradecimientos"
            aria-label="Créditos"
          >
            <Heart className="w-3.5 h-3.5 fill-emerald-500/20" />
          </button>
        )}

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            title="¿Cómo se juega?"
            aria-label="Ayuda"
          >
            ?
          </button>
        )}

        {onOpenLeaderboard && (
          <button
            onClick={onOpenLeaderboard}
            className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Ver tabla de posiciones"
          >
            🏆 <span className="hidden sm:inline">Récords</span>
          </button>
        )}
      </div>
    </header>
  );
}
