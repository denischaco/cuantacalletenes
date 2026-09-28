import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Share2,
  Check,
  UserCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Swords,
  Copy,
  Heart,
  Clock,
  Download,
  AlertCircle
} from 'lucide-react';
import { trackShareScore, trackSaveScore, trackSponsorClick } from '../services/analytics';
import { createChallenge } from '../services/firebase';
import { downloadChallengeCard } from '../utils/canvasCards';

export default function GameOverScreen({
  totalScore,
  totalTimeMs = 0,
  roundHistory = [],
  rank,
  zoneName,
  zoneId = 'centro',
  zoneSponsor = null,
  activeChallenge = null,
  onPlayAgain,
  onSaveScore,
  onOpenAdvertise,
  onOpenCredits,
  onOpenCouponModal = null
}) {
  const [playerName, setPlayerName] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [challengeUrl, setChallengeUrl] = useState('');
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [nameError, setNameError] = useState('');
  const [duelCardDownloaded, setDuelCardDownloaded] = useState(false);
  const nameInputRef = useRef(null);

  // Trigger celebratory confetti on screen mount
  useEffect(() => {
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 }
    });
  }, []);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const trimmed = playerName.trim();
    if (!trimmed) {
      setNameError('Por favor ingresá tu nombre o apodo.');
      nameInputRef.current?.focus();
      return;
    }
    setNameError('');
    if (saved) return;
    trackSaveScore({ totalScore, zoneName });
    onSaveScore(trimmed);
    setSaved(true);
  };

  const handleShare = async () => {
    trackShareScore({ totalScore, rankTitle: rank.title });
    const timeFormatted = totalTimeMs > 0 ? ` en ${(totalTimeMs / 1000).toFixed(1)}s` : '';
    const text = `¡Hice ${totalScore} de 10 puntos${timeFormatted} en "¿Cuánta Calle Tenés?" (Resistencia, Chaco)! Rango: ${rank.title} ${rank.badge}. ¿Te animás a superarme?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '¿Cuánta Calle Tenés? - Resistencia, Chaco',
          text,
          url: 'https://cuantacalletenes.denischaco.com.ar/'
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Create 1v1 challenge with mandatory name validation
  const handleCreateChallenge = async () => {
    const trimmed = playerName.trim();
    if (!trimmed) {
      setNameError('El nombre es obligatorio para crear el reto 1v1.');
      nameInputRef.current?.focus();
      return;
    }
    setNameError('');
    setIsCreatingChallenge(true);
    try {
      const streetIds = roundHistory.map((h) => h.street?.id).filter(Boolean);
      const res = await createChallenge({
        creatorName: trimmed,
        creatorScore: totalScore,
        creatorTimeMs: totalTimeMs,
        zoneId: zoneId || 'centro',
        streetIds
      });
      const challengeId = typeof res === 'object' ? res.challengeId : res;
      const encodedData = typeof res === 'object' ? res.encodedData : null;
      const url = `${window.location.origin}/?reto=${challengeId}${encodedData ? `&d=${encodedData}` : ''}`;
      setChallengeUrl(url);

      // Auto-save leaderboard record if not saved yet
      if (!saved) {
        onSaveScore(trimmed);
        setSaved(true);
      }

      // Copiar mensaje completo con contexto listo para pegar en cualquier chat
      const timeStr = totalTimeMs ? ` en ${(totalTimeMs / 1000).toFixed(1)}s` : '';
      const fullInviteMessage = `¡Te desafío en "¿Cuánta Calle Tenés?"! ⚔️\nHice ${totalScore}/10 pts${timeStr} en ${zoneName}.\n¿Podés superarme en el mismo circuito de calles?\n\nJugá acá 👉 ${url}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(fullInviteMessage);
        setChallengeCopied(true);
        setTimeout(() => setChallengeCopied(false), 3500);
      }
    } catch (err) {
      console.error('Error creating challenge:', err);
    } finally {
      setIsCreatingChallenge(false);
    }
  };

  // Head-to-Head calculations if playing an active 1v1 challenge
  const isDuelMode = Boolean(activeChallenge);
  const challengerName = activeChallenge?.creatorName || 'Retador';
  const challengerScore = Number(activeChallenge?.creatorScore) || 0;
  const challengerTimeMs = Number(activeChallenge?.creatorTimeMs) || 0;

  let duelOutcome = 'tie'; // 'win' | 'lose' | 'tie'
  let duelWinnerText = '¡Empate Técnico!';
  let duelSubtext = '¡Mismo puntaje!';
  let isPlayerWinner = false;

  if (isDuelMode) {
    if (totalScore > challengerScore) {
      duelOutcome = 'win';
      duelWinnerText = '¡GANASTE EL DUELO!';
      duelSubtext = `¡Superaste a ${challengerName} por ${totalScore - challengerScore} ${totalScore - challengerScore === 1 ? 'punto' : 'puntos'}!`;
      isPlayerWinner = true;
    } else if (totalScore < challengerScore) {
      duelOutcome = 'lose';
      duelWinnerText = `¡GANÓ ${challengerName.toUpperCase()}!`;
      duelSubtext = `${challengerName} te superó por ${challengerScore - totalScore} ${challengerScore - totalScore === 1 ? 'punto' : 'puntos'}. ¡Pedí revancha!`;
      isPlayerWinner = false;
    } else {
      // Score tie: speed tiebreaker
      if (totalTimeMs > 0 && challengerTimeMs > 0) {
        if (totalTimeMs < challengerTimeMs) {
          duelOutcome = 'win';
          duelWinnerText = '¡GANASTE POR VELOCIDAD!';
          duelSubtext = `Empate a ${totalScore} pts, pero fuiste ${((challengerTimeMs - totalTimeMs) / 1000).toFixed(1)}s más rápido`;
          isPlayerWinner = true;
        } else if (totalTimeMs > challengerTimeMs) {
          duelOutcome = 'lose';
          duelWinnerText = `¡GANÓ ${challengerName.toUpperCase()} POR VELOCIDAD!`;
          duelSubtext = `Empate a ${totalScore} pts, pero ${challengerName} fue ${((totalTimeMs - challengerTimeMs) / 1000).toFixed(1)}s más rápido`;
          isPlayerWinner = false;
        } else {
          duelOutcome = 'tie';
          duelWinnerText = '¡EMPATE TÉCNICO EXACTO!';
          duelSubtext = 'Mismo puntaje y mismo tiempo exacto. ¡Increíble partida!';
        }
      } else {
        duelOutcome = 'tie';
        duelWinnerText = '¡EMPATE TÉCNICO!';
        duelSubtext = `Ambos lograron ${totalScore} puntos`;
      }
    }
  }

  const handleDownloadDuelCard = () => {
    const trimmed = playerName.trim();
    if (trimmed && !saved) {
      onSaveScore(trimmed);
      setSaved(true);
    }
    downloadChallengeCard({
      creatorName: challengerName,
      creatorScore: challengerScore,
      creatorTimeMs: challengerTimeMs,
      playerName: trimmed || 'Desafiado',
      playerScore: totalScore,
      playerTimeMs: totalTimeMs,
      zoneName,
      winnerText: duelWinnerText
    });
    setDuelCardDownloaded(true);
    setTimeout(() => setDuelCardDownloaded(false), 3000);
  };

  return (
    <div className="absolute inset-0 z-[1500] flex items-center justify-center p-3 sm:p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-slate-950/80 backdrop-blur-md overflow-y-auto pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl my-auto space-y-4 sm:space-y-5 max-h-[calc(100dvh-2rem)] overflow-y-auto animate-scale-up">
        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 text-2xl shadow-lg shadow-amber-500/20 mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
            {isDuelMode ? '¡Duelo 1v1 Finalizado!' : '¡Partida Completada!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Circuito: <span className="text-slate-200 font-semibold">{zoneName}</span>
          </p>
        </div>

        {/* 1v1 HEAD-TO-HEAD COMPARISON CARD (Visible if playing a challenge) */}
        {isDuelMode && (
          <div className="p-4 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-[#180d05] border-2 border-[#F48138] shadow-2xl text-center space-y-3 animate-scale-up">
            {/* Winner Ribbon */}
            <div
              className={`p-2.5 rounded-xl border text-center ${
                duelOutcome === 'win'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                  : duelOutcome === 'lose'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-amber-950/80 border-amber-500 text-amber-300'
              }`}
            >
              <h3 className="font-heading font-black text-base sm:text-lg flex items-center justify-center gap-2">
                <span>{duelOutcome === 'win' ? '🏆' : duelOutcome === 'lose' ? '🥈' : '🤝'}</span>
                <span>{duelWinnerText}</span>
              </h3>
              <p className="text-[11px] opacity-90 mt-0.5 font-medium">{duelSubtext}</p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-2 text-left">
              {/* Card Retador */}
              <div
                className={`p-3 rounded-2xl border ${
                  !isPlayerWinner && duelOutcome !== 'tie'
                    ? 'bg-slate-900/90 border-[#38BDF8]'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider block">
                  Retador
                </span>
                <p className="font-heading font-black text-sm text-white truncate">{challengerName}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#38BDF8]">{challengerScore}</span>
                  <span className="text-[11px] text-slate-400">/ 10 pts</span>
                </div>
                {challengerTimeMs > 0 && (
                  <p className="text-[11px] text-amber-300 font-semibold mt-0.5">
                    ⏱️ {(challengerTimeMs / 1000).toFixed(1)}s
                  </p>
                )}
              </div>

              {/* Card Vos */}
              <div
                className={`p-3 rounded-2xl border ${
                  isPlayerWinner
                    ? 'bg-slate-900/90 border-emerald-500'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Vos
                </span>
                <p className="font-heading font-black text-sm text-white truncate">
                  {playerName.trim() || 'Jugador'}
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-400">{totalScore}</span>
                  <span className="text-[11px] text-slate-400">/ 10 pts</span>
                </div>
                {totalTimeMs > 0 && (
                  <p className="text-[11px] text-amber-300 font-semibold mt-0.5">
                    ⏱️ {(totalTimeMs / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
            </div>

            {/* Duel Actions: Download PNG image + WhatsApp response */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadDuelCard}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all cursor-pointer"
                title="Genera y descarga una imagen con el resultado del duelo para compartir"
              >
                <Download className="w-4 h-4" />
                <span>{duelCardDownloaded ? '¡Captura Descargada!' : '📸 Descargar Captura del Duelo (PNG)'}</span>
              </button>

              {(() => {
                let waVerdict = '';
                if (duelOutcome === 'win') {
                  waVerdict = '🏆 ¡Te gané el duelo!';
                } else if (duelOutcome === 'lose') {
                  waVerdict = `👏 ¡Me ganaste el duelo! ¿Sale revancha?`;
                } else {
                  waVerdict = '🤝 ¡Empatamos el duelo!';
                }

                const myLabel = playerName.trim() ? `Yo (${playerName.trim()})` : 'Yo (Desafiado)';
                const rivalLabel = `Vos (${challengerName})`;
                const myTimeStr = totalTimeMs > 0 ? ` en ${(totalTimeMs / 1000).toFixed(1)}s` : '';
                const rivalTimeStr = challengerTimeMs > 0 ? ` en ${(challengerTimeMs / 1000).toFixed(1)}s` : '';

                const replyText = `¡Ya completé tu reto en "¿Cuánta Calle Tenés?"! ⚔️\n\nResultado:\n• ${myLabel}: ${totalScore}/10 pts${myTimeStr}\n• ${rivalLabel}: ${challengerScore}/10 pts${rivalTimeStr}\n\n${waVerdict}\n\n¡Jugá acá! ${window.location.origin}`;

                return (
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(replyText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (playerName.trim() && !saved) {
                        onSaveScore(playerName.trim());
                        setSaved(true);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>📲 Responder Resultado a WhatsApp</span>
                  </a>
                );
              })()}
            </div>
          </div>
        )}

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

        {/* Total Score Badge & Time (0 to 10 scale) */}
        {!isDuelMode && (
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
            <p className="text-xs text-slate-400 uppercase font-semibold">Puntaje Final</p>
            <div className="text-4xl sm:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              {totalScore}
              <span className="text-lg text-slate-500 font-normal"> / 10 pts</span>
            </div>
            {totalTimeMs > 0 && (
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-0.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Tiempo total: <strong className="text-amber-400">{(totalTimeMs / 1000).toFixed(1)}s</strong></span>
              </p>
            )}
          </div>
        )}

        {/* Round Breakdown List */}
        <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/80">
          <p className="text-xs font-bold text-slate-400 uppercase px-1 mb-2">
            Detalle de las 5 calles:
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
            {roundHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/70"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 truncate block">
                      {item.street?.name || 'Calle'}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      {item.mode === 'write' ? '✍️ Escrita' : '💡 4 Opciones'} • {item.isCorrect ? 'Acierto' : 'Falló'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-right">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span
                    className={`font-bold w-14 ${
                      item.scoreDelta > 0 ? 'text-emerald-400' : item.scoreDelta < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {item.scoreDelta > 0 ? `+${item.scoreDelta}` : item.scoreDelta} {Math.abs(item.scoreDelta) === 1 ? 'pt' : 'pts'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save to Leaderboard Form (Mandatory Name Validation) */}
        {!saved ? (
          <div className="space-y-1.5">
            <form onSubmit={handleSave} className="flex gap-2">
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Ingresá tu nombre o apodo (obligatorio)..."
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  if (nameError) setNameError('');
                }}
                maxLength={24}
                className={`flex-1 bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors ${
                  nameError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </form>
            {nameError && (
              <p className="text-rose-400 text-xs flex items-center gap-1 pl-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{nameError}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>¡Récord de "{playerName}" guardado en la tabla de posiciones!</span>
          </div>
        )}

        {/* 1v1 Asynchronous Challenge Creator (Desafío por enlace) */}
        {!isDuelMode && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-orange-950/50 border border-[#F48138]/70 text-left space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Swords className="w-4 h-4 text-[#F48138]" />
                <span className="font-heading font-black text-xs sm:text-sm">
                  Desafío 1v1 Asincrónico
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F48138]/20 text-[#FFA559] border border-[#F48138]/40">
                Retá a tus amigos
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Retá a tus amigos a jugar exactamente las mismas calles que acabás de resolver para ver quién tiene más calle.
            </p>

            {!challengeUrl ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleCreateChallenge}
                  disabled={isCreatingChallenge}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>{isCreatingChallenge ? 'Generando desafío...' : '⚔️ Crear Reto 1v1 para WhatsApp'}</span>
                </button>
                {!playerName.trim() && (
                  <p className="text-[11px] text-amber-300/80 text-center">
                    * Escribí tu nombre arriba para firmar tu reto.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-1 animate-fade-in">
                <div className="p-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-[11px] text-amber-300 flex-1">{challengeUrl}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(challengeUrl);
                        setChallengeCopied(true);
                        setTimeout(() => setChallengeCopied(false), 2500);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[10px] shrink-0 cursor-pointer"
                      title="Copiar solo URL"
                    >
                      Copiar solo link
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const timeStr = totalTimeMs ? ` en ${(totalTimeMs / 1000).toFixed(1)}s` : '';
                      const fullMsg = `¡Te desafío en "¿Cuánta Calle Tenés?"! ⚔️\nHice ${totalScore}/10 pts${timeStr} en ${zoneName}.\n¿Podés superarme en el mismo circuito de calles?\n\nJugá acá 👉 ${challengeUrl}`;
                      navigator.clipboard.writeText(fullMsg);
                      setChallengeCopied(true);
                      setTimeout(() => setChallengeCopied(false), 3500);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{challengeCopied ? '¡Invitación copiada al portapapeles!' : '📋 Copiar Mensaje de Desafío Completo'}</span>
                  </button>
                </div>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `¡Te desafío en "¿Cuánta Calle Tenés?"! ⚔️\nHice ${totalScore}/10 pts${totalTimeMs ? ` en ${(totalTimeMs / 1000).toFixed(1)}s` : ''} en ${zoneName}.\n¿Podés superarme en el mismo circuito de calles?\n\nJugá acá 👉 ${challengeUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <span>📲 Compartir Reto por WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Official Zone Sponsor Feature Card (Tier: sponsor_zona) */}
        {zoneSponsor && (
          <div className="bg-gradient-to-br from-[#241105] via-slate-900 to-[#180a02] border-2 border-[#F48138]/80 rounded-2xl p-3.5 sm:p-4 shadow-xl text-left flex items-center justify-between gap-3 relative overflow-hidden animate-scale-up">
            <div className="flex items-center gap-3 min-w-0">
              <div
                style={{ backgroundColor: zoneSponsor.logoBg || '#FFFFFF' }}
                className="w-12 h-12 rounded-xl p-1 border border-[#F48138]/60 shadow-md flex items-center justify-center shrink-0 overflow-hidden"
              >
                {zoneSponsor.badge ? (
                  <img
                    src={zoneSponsor.badge}
                    alt={zoneSponsor.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl">⭐</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#FFA559] tracking-wider flex items-center gap-1">
                  <span>⭐ Auspiciante Oficial de Zona</span>
                </span>
                <h4 className="font-heading font-black text-base text-white leading-tight truncate">
                  {zoneSponsor.name}
                </h4>
                {zoneSponsor.address && (
                  <p className="text-[11px] text-slate-400 truncate">
                    {zoneSponsor.address} • {zoneSponsor.rubro || 'Comercio Destacado'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {zoneSponsor.coupon && zoneSponsor.coupon.active !== false && onOpenCouponModal && (
                <button
                  type="button"
                  onClick={() => onOpenCouponModal(zoneSponsor)}
                  className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-sm cursor-pointer"
                  title="Ver cupón con ID único y condiciones"
                >
                  <span>🎟️</span>
                  <span>Ver Cupón ({zoneSponsor.coupon.discount || '15% OFF'})</span>
                </button>
              )}

              {(zoneSponsor.coupon?.googleMapsUrl || zoneSponsor.googleMapsUrl) && (
                <a
                  href={zoneSponsor.coupon?.googleMapsUrl || zoneSponsor.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSponsorClick(zoneSponsor.name, 'game_over_how_to_get')}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#F48138]" />
                  <span className="hidden sm:inline">Cómo llegar</span>
                  <span className="sm:hidden">Ver</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleShare}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
          </button>
          <button
            onClick={onPlayAgain}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#339136] to-emerald-600 hover:from-emerald-600 hover:to-teal-500 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isDuelMode ? 'Volver al Inicio' : 'Jugar de Nuevo'}</span>
          </button>
        </div>

        {/* Credits & Merchant Links in GameOver screen */}
        <div className="pt-2 text-center border-t border-slate-800 space-y-1.5">
          {onOpenCredits && (
            <button
              type="button"
              onClick={onOpenCredits}
              className="text-[11px] text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Créditos & Agradecimientos institucionales</span>
            </button>
          )}

          {onOpenAdvertise && (
            <div>
              <button
                type="button"
                onClick={onOpenAdvertise}
                className="text-[11px] text-slate-400 hover:text-[#FFA559] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>📢</span>
                <span>¿Tenés un comercio? <u className="underline decoration-[#F48138]">Publicitá por los próximos 3 meses</u></span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
