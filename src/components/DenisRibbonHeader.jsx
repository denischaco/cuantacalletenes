import React, { useState } from 'react';
import { ExternalLink, Heart, Zap, Shield, Menu, X, Trophy, HelpCircle, KeyRound } from 'lucide-react';
import { useOnlineCount } from '../services/onlinePresence';
import { trackEvent } from '../services/analytics';
import InstagramIcon from './icons/InstagramIcon';

export default function DenisRibbonHeader({
  onOpenHelp,
  onOpenLeaderboard,
  onOpenAdvertise,
  onOpenCredits,
  onOpenLegal = null,
  onOpenGeoBoost = null,
  onOpenAdmin = null,
  currentZoneName,
  geoboost = null
}) {
  const onlineCount = useOnlineCount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAction = (callback) => {
    setIsMobileMenuOpen(false);
    if (callback) callback();
  };

  return (
    <>
      <header className="h-12 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo + Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden shrink-0 shadow-sm shadow-orange-950/40 ring-1 ring-[#F48138]/40">
              <img src="/icons/icon-192.png" alt="CCT" className="w-full h-full object-cover" />
            </div>
            <span className="font-heading font-black text-xs sm:text-sm text-white tracking-tight">
              <span className="hidden sm:inline">¿Cuánta Calle Tenés?</span>
              <span className="sm:hidden">¿Cuánta Calle?</span>
            </span>
          </div>

          {/* Live Online Players Badge (Visible on desktop/tablet md+) */}
          <span
            id="online-badge"
            className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-[11px] font-bold shadow-sm shrink-0"
            title="Jugadores conectados simultáneamente"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{onlineCount !== null ? `${onlineCount} jugando` : '🟢 En línea'}</span>
          </span>

          {/* GeoBoost 2x Live Header Badge (Compact on mobile, opens modal on click) */}
          {geoboost?.isBoostActive ? (
            <button
              type="button"
              onClick={onOpenGeoBoost}
              className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-950/90 hover:bg-amber-900 border border-amber-400 text-amber-300 text-[10px] sm:text-[11px] font-black shadow-sm shrink-0 animate-pulse cursor-pointer transition-colors"
              title={`Multiplicador 2x activo en ${geoboost.boostSponsor?.name || 'Local Sponsor'}. Tocá para ver detalles.`}
            >
              <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>2X</span>
              <span className="hidden sm:inline">ACTIVO</span>
            </button>
          ) : onOpenGeoBoost ? (
            <button
              type="button"
              onClick={onOpenGeoBoost}
              className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-[10px] font-semibold transition-colors cursor-pointer"
              title="¿Estás en un local amigo? Duplicá puntos (2X)"
            >
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span>Activar 2X</span>
            </button>
          ) : null}

          {/* Enlace discreto a la web personal mediante pill en pantallas grandes (lg+) */}
          <a
            href="https://denischaco.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shrink-0"
            title="Desarrollado por Denis Giménez (denischaco.com.ar)"
          >
            <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">By</span>
            <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">@denischaco</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </a>
        </div>

        {/* Right side: Quick actions on desktop + Clean Hamburger button on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {currentZoneName && (
            <span className="text-[11px] sm:text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50 max-w-[120px] sm:max-w-none truncate hidden xl:inline">
              📍 {currentZoneName}
            </span>
          )}

          {/* Desktop-only quick action buttons (hidden on mobile) */}
          {onOpenAdvertise && (
            <button
              onClick={onOpenAdvertise}
              className="hidden md:flex px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#F48138]/20 to-amber-500/20 hover:from-[#F48138]/30 hover:to-amber-500/30 border border-[#F48138]/50 text-[#FFA559] hover:text-white text-xs font-bold items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Publicitá tu comercio en el mapa"
            >
              <span>📢</span>
              <span>Sumá tu Local</span>
            </button>
          )}

          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="hidden md:flex px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer"
              title="Ver tabla de posiciones"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Récords</span>
            </button>
          )}

          {/* Hamburger Menu Toggle Button (Visible on mobile, cleans up header completely) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
            title="Menú de opciones"
            aria-label="Abrir menú"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-slate-200" />
            ) : (
              <Menu className="w-4 h-4 text-slate-200" />
            )}
          </button>
        </div>
      </header>

      {/* Hamburger Mobile Menu Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[2000] flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs bg-slate-900 border-l border-slate-800 h-full p-4 sm:p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto animate-slide-left">
            {/* Top drawer section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-[#F48138]/40 shrink-0">
                    <img src="/icons/icon-192.png" alt="CCT" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-sm text-white">¿Cuánta Calle?</h3>
                    <p className="text-[10px] text-slate-400">Resistencia, Chaco</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status info in mobile drawer */}
              <div className="space-y-2">
                {/* Online count */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <span className="text-slate-400">Jugadores activos:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>{onlineCount !== null ? `${onlineCount} en línea` : '🟢 En línea'}</span>
                  </span>
                </div>

                {/* GeoBoost status card if active or trigger button in drawer */}
                {geoboost?.isBoostActive ? (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenGeoBoost)}
                    className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-400/50 flex items-center justify-between text-xs text-amber-300 text-left cursor-pointer hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold shrink-0">
                        <Zap className="w-4 h-4 fill-slate-950" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-heading font-black block text-[11px] uppercase tracking-wide">
                          ¡GeoBoost 2X Activo!
                        </span>
                        <span className="text-[10px] text-amber-200/90 block truncate">
                          {geoboost.boostSponsor?.name || 'Local Sponsor'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-300/80 shrink-0 font-semibold">Info ➔</span>
                  </button>
                ) : onOpenGeoBoost ? (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenGeoBoost)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="p-1 rounded bg-amber-500/10 text-amber-400 shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] truncate">¿Estás en un local? Duplicá (2X)</span>
                    </div>
                    <span className="text-slate-500 text-xs shrink-0">➔</span>
                  </button>
                ) : null}
              </div>

              {/* Menu Navigation Items */}
              <nav className="space-y-1.5 pt-1">
                {onOpenLeaderboard && (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenLeaderboard)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left flex items-center gap-3 transition-all cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-heading font-bold text-xs text-white block group-hover:text-amber-300 transition-colors">
                        Tabla de Récords
                      </span>
                      <span className="text-[10px] text-slate-400 block">Mejores puntajes y ranking</span>
                    </div>
                  </button>
                )}

                {onOpenHelp && (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenHelp)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left flex items-center gap-3 transition-all cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-heading font-bold text-xs text-white block group-hover:text-emerald-300 transition-colors">
                        ¿Cómo jugar?
                      </span>
                      <span className="text-[10px] text-slate-400 block">Reglas, puntajes y consejos</span>
                    </div>
                  </button>
                )}

                {/* Featured Instagram Follow Menu Item */}
                <a
                  href="https://www.instagram.com/cuantacalletenes"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent('social_follow_click', { platform: 'instagram', placement: 'hamburger_menu' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/25 to-slate-950/80 hover:from-pink-950/60 hover:to-purple-900/40 border border-pink-500/40 hover:border-pink-400 text-left flex items-center gap-3 transition-all cursor-pointer group shadow-sm shadow-pink-950/30"
                >
                  <div className="p-2 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md shadow-pink-500/25 shrink-0 group-hover:scale-105 transition-transform">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading font-bold text-xs text-white block group-hover:text-pink-300 transition-colors">
                        Seguinos en Instagram
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                        Comunidad
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300 block truncate">
                      Novedades y desafíos
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-300 transition-colors shrink-0" />
                </a>

                {onOpenAdvertise && (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenAdvertise)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-[#F48138]/50 text-left flex items-center gap-3 transition-all cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-orange-500/10 text-[#FFA559] group-hover:bg-[#F48138] group-hover:text-slate-950 transition-colors shrink-0 text-xs">
                      📢
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-heading font-bold text-xs text-white block group-hover:text-[#FFA559] transition-colors">
                        Sumá tu Local
                      </span>
                      <span className="text-[10px] text-slate-400 block">Publicitá tu comercio en el mapa</span>
                    </div>
                  </button>
                )}

                {onOpenCredits && (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenCredits)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left flex items-center gap-3 transition-all cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-heading font-bold text-xs text-white block group-hover:text-emerald-300 transition-colors">
                        Créditos
                      </span>
                      <span className="text-[10px] text-slate-400 block">Equipo y agradecimientos</span>
                    </div>
                  </button>
                )}

                {onOpenLegal && (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenLegal)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left flex items-center gap-3 transition-all cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-heading font-bold text-xs text-white block group-hover:text-amber-300 transition-colors">
                        Términos & Privacidad
                      </span>
                      <span className="text-[10px] text-slate-400 block">Protección de datos (Ley 25.326)</span>
                    </div>
                  </button>
                )}

                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenAdmin)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-[#F48138]/40 hover:border-[#F48138] text-left flex items-center gap-3 transition-all cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-[#F48138]/15 text-[#FFA559] group-hover:bg-[#F48138] group-hover:text-slate-950 transition-colors shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-heading font-bold text-xs text-white block group-hover:text-[#FFA559] transition-colors">
                        Portal Sponsors & Admin
                      </span>
                      <span className="text-[10px] text-slate-400 block">Gestión y validación de cupones</span>
                    </div>
                  </button>
                )}
              </nav>
            </div>

            {/* Bottom Drawer Footer: Signed with @denischaco */}
            <div className="pt-4 mt-4 border-t border-slate-800 text-center">
              <a
                href="https://denischaco.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-xs text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all group"
                title="Desarrollado por Denis Giménez"
              >
                <span>Desarrollado por</span>
                <strong className="text-emerald-400 group-hover:text-emerald-300 font-semibold">@denischaco</strong>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
              </a>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Hecho con orgullo en Resistencia, Chaco
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
