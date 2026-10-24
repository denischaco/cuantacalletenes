import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Trash2,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Shield,
  X,
  MapPin,
  RotateCcw,
  Loader2
} from 'lucide-react';
import {
  subscribeLeaderboard,
  deleteLeaderboardEntry,
  clearLeaderboard
} from '../../services/firebase';

const ZONES = [
  { id: 'all', label: 'Todas las Zonas' },
  { id: 'centro', label: '4 Avenidas (Centro)' },
  { id: 'macrocentro', label: 'Macrocentro' },
  { id: 'toda_ciudad', label: 'Gran Resistencia' }
];

export default function LeaderboardModeration() {
  const [scores, setScores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Escuchar en tiempo real los registros de Firestore
  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((updatedScores) => {
      setScores(updatedScores || []);
    });
    return () => unsubscribe();
  }, []);

  // Filtrado de puntajes por texto de búsqueda y por zona
  const filteredScores = useMemo(() => {
    let result = [...scores];

    // Filtro por zona
    if (selectedZone !== 'all') {
      result = result.filter((s) => {
        const zId = s.zoneId || '';
        const zName = (s.zone || '').toLowerCase();
        if (selectedZone === 'centro') {
          return zId === 'centro' || zName.includes('4 avenidas') || zName.includes('centro');
        }
        if (selectedZone === 'macrocentro') {
          return zId === 'macrocentro' || zName.includes('macro');
        }
        if (selectedZone === 'toda_ciudad') {
          return zId === 'toda_ciudad' || zName.includes('gran') || zName.includes('ciudad');
        }
        return true;
      });
    }

    // Filtro por búsqueda de nombre
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter((s) => (s.name || '').toLowerCase().includes(query));
    }

    return result;
  }, [scores, selectedZone, searchTerm]);

  // Manejador para eliminar un récord individual ofensivo
  const handleDeleteScore = async (item) => {
    const confirmDelete = window.confirm(
      `¿Deseás eliminar el récord de "${item.name}" (${item.score}/10 pts en ${item.zone || 'Resistencia'}) permanentemente?\n\nEsta acción quitará el nombre del podio en vivo para todos los usuarios.`
    );
    if (!confirmDelete) return;

    setDeletingId(item.id || item.name);
    setActionNotice('');
    setActionError('');

    try {
      const res = await deleteLeaderboardEntry(item.id, item.name);
      if (res.success) {
        setActionNotice(`✅ El récord de "${item.name}" fue eliminado del podio en vivo.`);
        setTimeout(() => setActionNotice(''), 4500);
      } else {
        setActionError(`Error al eliminar: ${res.error || 'No se pudo completar la operación'}`);
      }
    } catch (err) {
      setActionError(`Error inesperado: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Manejador para vaciar la tabla por temporada/torneo
  const handleResetSeason = async () => {
    setResetting(true);
    setActionNotice('');
    setActionError('');

    try {
      const zoneToReset = selectedZone === 'all' ? null : selectedZone;
      const res = await clearLeaderboard(zoneToReset);
      if (res.success) {
        setActionNotice(`🏆 Se purgaron ${res.count} récords de la base de datos (${selectedZone === 'all' ? 'Todas las zonas' : selectedZone}).`);
        setIsResetConfirmOpen(false);
        setTimeout(() => setActionNotice(''), 5000);
      } else {
        setActionError(`Error al reiniciar: ${res.error}`);
      }
    } catch (err) {
      setActionError(`Error inesperado: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de Mensaje de Acción */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-3 shadow-lg animate-scale-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold text-xs sm:text-sm">{actionNotice}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 flex items-center gap-3 shadow-lg animate-scale-up">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-bold text-xs sm:text-sm">{actionError}</span>
        </div>
      )}

      {/* Tarjeta de Encabezado y Estadísticas */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg sm:text-xl text-white">
                  Moderación del Ranking en Vivo
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Tiempo Real
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Eliminá con 1 toque nombres ofensivos, récords duplicados o de prueba desde tu celular.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Vaciar tabla para una nueva temporada o torneo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Temporada</span>
            </button>
          </div>
        </div>

        {/* Buscador de Nombre y Filtro de Zona */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Input Buscador */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o apodo sospechoso (ej: Juan, Mati...)"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro de Zonas */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
            >
              {ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen numérico */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <span>
            Mostrando <strong>{filteredScores.length}</strong> de <strong>{scores.length}</strong> récords registrados.
          </span>
          {searchTerm && (
            <span className="text-amber-400 text-[11px] font-semibold">
              Filtro activo por: "{searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* Lista de Récords del Ranking */}
      <div className="space-y-2.5">
        {filteredScores.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="font-heading font-bold text-white text-base">
              No se encontraron registros
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? `No hay ningún récord que contenga "${searchTerm}". Podés limpiar la búsqueda.`
                : 'La tabla de posiciones se encuentra vacía para la zona seleccionada.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          filteredScores.map((item, index) => {
            const isDeleting = deletingId === item.id || deletingId === item.name;
            const timeSec = item.totalTimeMs ? (item.totalTimeMs / 1000).toFixed(1) : null;

            return (
              <div
                key={item.id || `${item.name}-${index}`}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all space-y-3 shadow-md"
              >
                {/* Fila Principal: Posición, Nombre, Zona y Puntaje */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Número de Podio */}
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-heading font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-inner ${
                        index === 0
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950'
                          : index === 1
                          ? 'bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-900'
                          : index === 2
                          ? 'bg-gradient-to-tr from-amber-700 to-amber-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Nombre y Circuito */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading font-black text-sm sm:text-base text-white tracking-wide truncate">
                          {item.name || 'Sin nombre'}
                        </span>
                        <span className="text-base" title="Rango">{item.rankBadge || '🚕'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-300 truncate">{item.zone || '4 Avenidas'}</span>
                        <span>•</span>
                        <span className="shrink-0">{item.date || 'Reciente'}</span>
                        {timeSec && (
                          <>
                            <span>•</span>
                            <span className="text-amber-300/90 font-mono shrink-0">⏱️ {timeSec}s</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge de Puntaje Destacado */}
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-heading font-black shrink-0 ${
                      item.score >= 8
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : item.score >= 5
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {item.score} / 10 pts
                  </span>
                </div>

                {/* Fila Inferior: ID de Documento y Botón de Moderación */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px] sm:max-w-none">
                    ID: {item.id ? `${item.id.slice(0, 12)}…` : 'local'}
                  </span>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDeleteScore(item)}
                    className="py-1.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/70 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                    title="Eliminar este récord del ranking en vivo"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>{isDeleting ? 'Borrando...' : 'Eliminar Récord'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Confirmación para Reiniciar Temporada */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-white">
                ¿Reiniciar Temporada de Ranking?
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta acción eliminará de forma irreversible los récords de la base de datos Firestore para:{' '}
              <strong className="text-amber-400">
                {selectedZone === 'all' ? 'Todas las zonas de la ciudad' : selectedZone}
              </strong>.
            </p>

            <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              💡 <strong>Recomendación:</strong> Usá esta función solo cuando comience un nuevo mes o desees limpiar totalmente la tabla para un sorteo o torneo nuevo.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={resetting}
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleResetSeason}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                {resetting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{resetting ? 'Purgando...' : 'Confirmar y Vaciar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
