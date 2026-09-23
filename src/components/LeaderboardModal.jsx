import React, { useState, useEffect } from 'react';
import { Trophy, X, Trash2, Lock, Unlock, CheckCircle, AlertCircle, RefreshCw, ShieldCheck, MapPin } from 'lucide-react';
import { subscribeLeaderboard, clearLeaderboardWithPassword, deleteScoreEntry, sendTestScoreToFirestore, ADMIN_CLEAR_PASSWORD } from '../services/firebase';
import sponsorsData from '../data/sponsors.json';

export default function LeaderboardModal({ onClose }) {
  const [scores, setScores] = useState([]);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [deletingIndex, setDeletingIndex] = useState(null);

  // Level 3 Sponsors (Tier: sponsor_zona)
  const level3Sponsors = sponsorsData.filter(
    (s) => s.active !== false && (s.plan === 'sponsor_zona' || s.tier === 3 || s.level === 3)
  );

  // Subscribe to real-time updates (Firestore + Local fallback)
  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((updatedScores) => {
      setScores(updatedScores);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleOpenPrompt = () => {
    setShowPasswordPrompt(true);
    setPasswordInput('');
    setPasswordError('');
    setSuccessMessage('');
  };

  const handleUnlockAdmin = (e) => {
    if (e) e.preventDefault();
    if (!passwordInput) {
      setPasswordError('Ingresá la contraseña de administrador');
      return;
    }

    if (passwordInput === ADMIN_CLEAR_PASSWORD) {
      setAdminUnlocked(true);
      setAdminPassword(passwordInput);
      setShowPasswordPrompt(false);
      setPasswordError('');
      setSuccessMessage('¡Modo moderación activado!');
      setTimeout(() => setSuccessMessage(''), 2500);
    } else {
      setPasswordError('Contraseña incorrecta');
    }
  };

  const handleDeleteSingle = async (item, idx) => {
    if (!window.confirm(`¿Seguro que querés eliminar el registro de "${item.name}" (${item.score} pts)?`)) {
      return;
    }
    setDeletingIndex(idx);
    const res = await deleteScoreEntry(item.id, idx, adminPassword);
    setDeletingIndex(null);
    if (!res.success) {
      alert(res.error || 'No se pudo eliminar el registro');
    }
  };

  const handleConfirmClearAll = async () => {
    if (!window.confirm('⚠️ ¿Estás seguro de que querés VACIAR TODA la tabla de récords? Esta acción no se puede deshacer.')) {
      return;
    }
    setIsClearing(true);
    const res = await clearLeaderboardWithPassword(adminPassword);
    setIsClearing(false);
    if (res.success) {
      setScores([]);
      setSuccessMessage('¡Toda la tabla ha sido vaciada!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } else {
      alert(res.error || 'Error al vaciar la tabla');
    }
  };

  const handleSendTestScore = async () => {
    setIsSendingTest(true);
    const res = await sendTestScoreToFirestore();
    setIsSendingTest(false);
    if (res.success) {
      setSuccessMessage('¡Récord de prueba guardado en Firestore! Revisá la consola de Firebase.');
      setTimeout(() => setSuccessMessage(''), 3500);
    } else {
      alert(`Error al guardar en Firestore:\n${res.error}\n\nRevisá que Firestore Database esté creado en el proyecto "cuantacalletenes" y que las reglas permitan lectura y escritura.`);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3.5 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5" />
            <h3 className="font-heading font-black text-lg text-white">
              Tabla de Récords
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success message banner */}
        {successMessage && (
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Admin Mode Badge */}
        {adminUnlocked && (
          <div className="p-2.5 bg-amber-950/50 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Modo Moderación Activo</span>
            </div>
            <button
              onClick={() => setAdminUnlocked(false)}
              className="text-[11px] text-amber-400/80 hover:text-amber-200 underline cursor-pointer"
            >
              Salir
            </button>
          </div>
        )}

        {/* Scores Table */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {scores.length === 0 ? (
            <p className="text-xs text-center text-slate-500 py-6">
              Aún no hay puntuaciones guardadas. ¡Jugá una tanda para inaugurar la tabla!
            </p>
          ) : (
            scores.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  adminUnlocked
                    ? 'bg-slate-950/90 border-slate-700 hover:border-rose-500/50'
                    : 'bg-slate-950/70 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
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
                  <div className="truncate">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.name} <span className="text-base">{item.rankBadge}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {item.zone} • {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-heading font-black text-emerald-400">
                      {item.score.toLocaleString('es-AR')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">pts</span>
                  </div>

                  {/* Individual Delete Button in Moderation Mode */}
                  {adminUnlocked && (
                    <button
                      onClick={() => handleDeleteSingle(item, idx)}
                      disabled={deletingIndex === idx}
                      title={`Eliminar solo a ${item.name}`}
                      className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-600 border border-rose-800/60 text-rose-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {deletingIndex === idx ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Level 3 Sponsors Showcase (uno debajo del otro) */}
        {level3Sponsors.length > 0 && (
          <div className="pt-2.5 border-t border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>⭐</span>
                <span>Auspiciantes Oficiales de Zona</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Nivel 3</span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-0.5">
              {level3Sponsors.map((sp) => (
                <div
                  key={sp.id}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-[#241105] via-slate-900 to-[#180a02] border border-[#F48138]/50 shadow-md flex items-center justify-between gap-2.5 transition-colors hover:border-[#F48138]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      style={{ backgroundColor: sp.logoBg || '#FFFFFF' }}
                      className="w-10 h-10 rounded-xl p-1 border border-[#F48138]/60 shadow-sm flex items-center justify-center shrink-0 overflow-hidden"
                    >
                      {sp.badge ? (
                        <img
                          src={sp.badge}
                          alt={sp.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xl">⭐</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-black text-xs sm:text-sm text-white truncate">
                          {sp.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {sp.address ? `${sp.address} • ` : ''}{sp.rubro || 'Comercio Destacado'}
                      </p>
                    </div>
                  </div>

                  {(sp.coupon?.googleMapsUrl || sp.googleMapsUrl) && (
                    <a
                      href={sp.coupon?.googleMapsUrl || sp.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-[#F48138]" />
                      <span className="hidden sm:inline">Cómo llegar</span>
                      <span className="sm:hidden">Ver</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password Modal Prompt for Moderation Mode */}
        {showPasswordPrompt && (
          <form onSubmit={handleUnlockAdmin} className="p-3.5 bg-slate-950/90 border border-amber-900/60 rounded-2xl space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Acceso Moderador</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPasswordPrompt(false)}
                className="text-slate-500 hover:text-slate-300 text-[11px] cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Ingresá la clave de moderación para borrar registros individuales o vaciar la tabla:
            </p>

            <div className="space-y-1">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Ingresá la clave de moderador..."
                autoFocus
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />

              {passwordError && (
                <p className="text-rose-400 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Desbloquear Moderación</span>
            </button>
          </form>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          {!adminUnlocked && !showPasswordPrompt && (
            <button
              onClick={handleOpenPrompt}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-slate-800/80"
              title="Moderar tabla (borrar un registro o vaciar)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Moderar tabla</span>
            </button>
          )}

          {adminUnlocked && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendTestScore}
                disabled={isSendingTest}
                className="text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition-colors px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-xs font-semibold"
                title="Crea un registro de prueba en Firestore para inicializar y verificar la colección"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Probando...</span>
                  </>
                ) : (
                  <span>🧪 Crear prueba en Firebase</span>
                )}
              </button>

              {scores.length > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmClearAll}
                  disabled={isClearing}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-rose-950/40 border border-rose-900/50"
                  title="Vaciar toda la tabla"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isClearing ? 'Vaciando...' : 'Vaciar todo'}</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="ml-auto py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
