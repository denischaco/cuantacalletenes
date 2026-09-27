import { useState, useMemo } from 'react';
import { X, Landmark, Lock, MapPin, ExternalLink, Trophy } from 'lucide-react';
import { getAlbumStats, getUnlockedSculptureIds, getSculptureUrl } from '../utils/sculptureUtils';

export default function SculpturesAlbumModal({ onClose }) {
  const unlockedIds = useMemo(() => getUnlockedSculptureIds(), []);
  const [selectedSculpture, setSelectedSculpture] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unlocked', 'locked'

  const { total, unlockedCount, percent, catalog } = useMemo(() => getAlbumStats(), []);

  // Filtrado de la grilla con comparación numérica segura
  const filteredCatalog = useMemo(() => {
    if (activeFilter === 'unlocked') {
      return catalog.filter(s => unlockedIds.includes(Number(s.catalogId)));
    }
    if (activeFilter === 'locked') {
      return catalog.filter(s => !unlockedIds.includes(Number(s.catalogId)));
    }
    return catalog;
  }, [catalog, unlockedIds, activeFilter]);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto animate-scale-up">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Landmark className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white">
                Álbum de Esculturas
              </h3>
              <p className="text-[11px] text-slate-400">Museo a Cielo Abierto de Resistencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Cerrar Álbum"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progreso y Estadísticas */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Colección Descubierta:</span>
            </span>
            <span className="font-black text-emerald-400 font-heading text-sm sm:text-base">
              {unlockedCount} / {total} ({percent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-700 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-center pt-0.5">
            ¡Adiviná calles con esculturas en sus inmediaciones para desbloquear los cromos de la ciudad!
          </p>
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todas ({total})
          </button>
          <button
            onClick={() => setActiveFilter('unlocked')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'unlocked'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Desbloqueadas ({unlockedCount})
          </button>
          <button
            onClick={() => setActiveFilter('locked')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'locked'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Por descubrir ({total - unlockedCount})
          </button>
        </div>

        {/* Grilla de Cromos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {filteredCatalog.map((sculpture) => {
            const isUnlocked = unlockedIds.includes(sculpture.catalogId);

            return (
              <div
                key={sculpture.id}
                onClick={() => isUnlocked && setSelectedSculpture(sculpture)}
                className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-between min-h-[180px] ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-emerald-500/40 hover:border-emerald-400 cursor-pointer shadow-md hover:scale-[1.02]'
                    : 'bg-slate-950/30 border-slate-800/80 opacity-65'
                }`}
              >
                {/* Imagen del Cromo o Silueta Candado */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow-inner">
                  {isUnlocked && sculpture.imageUrl ? (
                    <img
                      src={sculpture.imageUrl}
                      alt={sculpture.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
                      <Lock className="w-7 h-7 text-slate-600" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                        Bloqueada
                      </span>
                    </div>
                  )}
                </div>

                {/* Título y Artista */}
                <div className="mt-2 w-full">
                  <h4 className={`text-xs font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                    {isUnlocked ? sculpture.title : '???'}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {isUnlocked ? sculpture.artist : (sculpture.locationDescription || 'Resistencia')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de Detalle al Cliquear un Cromo Desbloqueado */}
        {selectedSculpture && (
          <div className="fixed inset-0 z-[2010] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/50 rounded-3xl p-5 shadow-2xl space-y-3 animate-scale-up text-left">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                <img
                  src={selectedSculpture.imageUrl}
                  alt={selectedSculpture.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-lg font-heading font-black text-white">
                  {selectedSculpture.title}
                </h3>
                <p className="text-xs text-emerald-400 font-bold">
                  {selectedSculpture.artist} {selectedSculpture.year ? `(${selectedSculpture.year})` : ''}
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto">
                {selectedSculpture.description && selectedSculpture.description.length > 5
                  ? selectedSculpture.description
                  : 'Obra escultórica patrimonial emplazada en el espacio público urbano de la Ciudad de las Esculturas.'}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{selectedSculpture.locationDescription || 'Resistencia, Chaco'}</span>
              </div>

              <div className="pt-2 flex gap-2">
                <a
                  href={getSculptureUrl(selectedSculpture.catalogId || selectedSculpture.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Ficha en Museo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setSelectedSculpture(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
