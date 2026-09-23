import React, { useState, useEffect } from 'react';
import { Sparkles, Edit3, ListOrdered, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Lock } from 'lucide-react';

function renderSponsorBadge(badge, name = 'Sponsor', logoBg = '#FFFFFF') {
  if (!badge) return <span>🍔</span>;
  if (
    typeof badge === 'string' &&
    (badge.startsWith('/') || badge.startsWith('http') || /\.(png|jpe?g|svg|webp|gif)/i.test(badge))
  ) {
    return (
      <span
        style={{ backgroundColor: logoBg }}
        className="w-7 h-7 rounded-lg inline-flex items-center justify-center p-0.5 border border-[#F48138]/50 shadow-sm overflow-hidden shrink-0 align-middle"
      >
        <img
          src={badge}
          alt={name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </span>
    );
  }
  return <span>{badge}</span>;
}

export default function RoundHUD({
  currentRound,
  totalRounds,
  score,
  options = [],
  onSubmitGuess,
  currentStreet = null
}) {
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'options'
  const [hasSeenOptions, setHasSeenOptions] = useState(false);
  const [writtenGuess, setWrittenGuess] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputError, setInputError] = useState('');

  // Reset state on each new round
  useEffect(() => {
    setActiveTab('write');
    setHasSeenOptions(false);
    setWrittenGuess('');
    setSelectedOptionId(null);
    setInputError('');
    setIsMinimized(false);
  }, [currentRound]);

  // Handle Write Guess Submission
  const handleWriteSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = writtenGuess.trim();
    if (!trimmed) {
      setInputError('Por favor escribí el nombre de la calle');
      return;
    }
    setInputError('');
    onSubmitGuess({
      mode: 'write',
      guess: trimmed
    });
  };

  // Handle Option Selection and Submission
  const handleOptionSubmit = () => {
    if (!selectedOptionId) return;
    const chosenStreet = options.find(o => o.id === selectedOptionId);
    if (!chosenStreet) return;

    onSubmitGuess({
      mode: 'multiple_choice',
      guess: chosenStreet.name,
      streetId: chosenStreet.id
    });
  };

  const handleSwitchToOptions = () => {
    setActiveTab('options');
    setHasSeenOptions(true);
    setInputError('');
  };

  return (
    <>
      {/* 1. Top Banner: Round status & Score */}
      <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-lg pointer-events-auto">
        <div className={`glass-panel border rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-md ${
          currentStreet?.isSponsored
            ? 'bg-gradient-to-b from-slate-900 via-[#1a0f05] to-slate-900 border-[#F48138]/60 shadow-amber-950/40'
            : 'bg-slate-900/95 border-slate-700/80'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] sm:text-xs ${
              currentStreet?.isSponsored
                ? 'bg-amber-500/20 text-[#FFA559] border-[#F48138]/50 font-bold'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}>
              {currentStreet?.isSponsored ? '⭐ Ronda Especial' : `Ronda ${currentRound} de ${totalRounds}`}
            </span>

            <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/40 px-3 py-0.5 rounded-full font-bold text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{score} / 10 pts</span>
            </div>
          </div>

          {currentStreet?.isSponsored ? (
            <div className="text-center py-0.5">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 mb-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[#F48138] text-[10px] font-bold uppercase tracking-wider">
                <span>⭐ Desafío Gastronómico Local</span>
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-heading font-black text-white tracking-tight drop-shadow flex items-center justify-center gap-1.5">
                {renderSponsorBadge(currentStreet.sponsor?.badge, currentStreet.sponsor?.name, currentStreet.sponsor?.logoBg)}
                <span>¿En qué calle queda {currentStreet.sponsor?.name || 'este local'}?</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-amber-200/90 mt-0.5 font-medium">
                📍 Adiviná la calle (+2 pts) o la dirección exacta con número (+4 pts){
                  currentStreet?.sponsor?.coupon &&
                  currentStreet.sponsor.hasCoupon !== false &&
                  currentStreet.sponsor.coupon.active !== false &&
                  currentStreet.sponsor.coupon.enabled !== false
                    ? ' y desbloqueá tu cupón con descuento.'
                    : '.'
                }
              </p>
            </div>
          ) : (
            <div className="text-center py-0.5">
              <h2 className="text-sm sm:text-lg md:text-xl font-heading font-black text-white tracking-tight drop-shadow">
                ¿Qué calle pasa por el punto verde?
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                Inspeccioná la cuadra en el mapa mudo y elegí tu modalidad de respuesta:
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Minimized Floating Trigger Button (when user collapsed panel to inspect map) */}
      {isMinimized && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-bounce-short pb-[env(safe-area-inset-bottom,0px)]">
          <button
            onClick={() => setIsMinimized(false)}
            className="bg-gradient-to-r from-[#339136] to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-bold text-sm px-6 py-2.5 sm:py-3 rounded-full shadow-2xl border border-emerald-400/40 flex items-center gap-2 cursor-pointer"
          >
            <span>🎯 Adivinar Calle</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Bottom Interactive Guess Panel */}
      {!isMinimized && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-lg pointer-events-auto pb-[env(safe-area-inset-bottom,0px)] animate-slide-up">
          <div className="glass-panel bg-slate-900/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl max-h-[calc(100dvh-5.5rem)] overflow-y-auto">
            {/* Header with Mode Tabs and Minimize button */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 sm:pb-3 mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Tab 1: Escribir (disabled once user views the options) */}
                <button
                  type="button"
                  disabled={hasSeenOptions}
                  onClick={() => {
                    if (!hasSeenOptions) {
                      setActiveTab('write');
                      setInputError('');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
                    hasSeenOptions
                      ? 'opacity-35 cursor-not-allowed text-slate-500 bg-slate-950/40 border border-slate-800'
                      : activeTab === 'write'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm cursor-pointer'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 cursor-pointer'
                  }`}
                  title={
                    hasSeenOptions
                      ? 'Regla del juego: Al ver las 4 opciones, perdés el derecho a adivinar directo'
                      : 'Escribí el nombre exacto de la calle'
                  }
                >
                  {hasSeenOptions ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{currentStreet?.isSponsored ? 'Escribir (+2 / +4 pts)' : 'Escribir (+2 pts)'}</span>
                  {hasSeenOptions && <span className="text-[10px] text-amber-400/80 font-normal">(Bloqueado)</span>}
                </button>

                {/* Tab 2: 4 Opciones */}
                <button
                  type="button"
                  onClick={handleSwitchToOptions}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'options'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>4 Opciones (+1 pt)</span>
                </button>
              </div>

              {/* Minimize button to inspect map freely */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Minimizar panel para ver el mapa completo"
              >
                <span className="hidden xs:inline text-[11px]">Ver mapa</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: WRITE EXACT NAME (+2 / +4 PTS) */}
            {activeTab === 'write' && (
              <form onSubmit={handleWriteSubmit} className="space-y-2.5 sm:space-y-3">
                {currentStreet?.isSponsored ? (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#2a1305]/60 to-slate-900 border border-[#F48138]/60 text-amber-200 text-[11px] sm:text-xs flex items-start gap-2">
                    <span className="text-sm sm:text-base">⭐</span>
                    <p className="leading-snug">
                      <strong className="text-[#FFA559]">¡Desafío Sponsor!</strong> Adiviná la calle (<span className="text-emerald-400 font-bold">+2 pts</span>) o acertá la dirección exacta con número (<span className="text-[#FFA559] font-black">+4 pts</span>).
                    </p>
                  </div>
                ) : (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/30 text-emerald-300 text-[11px] sm:text-xs flex items-start gap-2">
                    <span className="text-sm sm:text-base">✍️</span>
                    <p className="leading-snug">
                      <strong className="text-white">¡Ganá 2 puntos!</strong> Ingresá el nombre completo respetando acentos y diéresis (ej: <em>Güemes</em>, <em>Julio A. Roca</em>, <em>9 de Julio</em>).
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={writtenGuess}
                      onChange={(e) => {
                        setWrittenGuess(e.target.value);
                        if (inputError) setInputError('');
                      }}
                      placeholder={currentStreet?.isSponsored ? "Escribí la calle o dirección exacta (ej: French 683)..." : "Escribí el nombre exacto de la calle..."}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                      autoFocus
                    />
                  </div>

                  {inputError && (
                    <p className="text-rose-400 text-xs flex items-center gap-1 mt-1 pl-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{inputError}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-0.5">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#339136] to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
                  >
                    <span>{currentStreet?.isSponsored ? 'Confirmar Respuesta (+2 o +4 pts)' : 'Confirmar Nombre (+2 pts)'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: MULTIPLE CHOICE OPTIONS (+1 PT, -1 PT IF WRONG) */}
            {activeTab === 'options' && (
              <div className="space-y-2.5 sm:space-y-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30 text-amber-300 text-[11px] sm:text-xs flex items-start gap-2">
                  <span className="text-sm sm:text-base">💡</span>
                  <p className="leading-snug">
                    <strong className="text-white">Modo 4 Opciones:</strong> Seleccioná la calle correcta para sumar <span className="font-bold text-emerald-400">+1 punto</span>. Si errás, <span className="font-bold text-rose-400">-1 punto</span> (con piso en 0).
                  </p>
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all flex items-center justify-between text-xs sm:text-sm font-medium cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/50 scale-[1.01]'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-950'
                        }`}
                      >
                        <span className="truncate pr-2 font-semibold">{opt.name}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit button for options */}
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleOptionSubmit}
                    disabled={!selectedOptionId}
                    className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#F48138] to-[#B95D0E] hover:from-[#F48138]/90 hover:to-[#B95D0E]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-heading font-bold text-xs sm:text-sm shadow-lg shadow-orange-950/40 border border-orange-400/30 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
                  >
                    <span>Confirmar Opción (+1 pt)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
