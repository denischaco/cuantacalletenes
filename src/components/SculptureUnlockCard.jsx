import { useState } from 'react';
import { Landmark, ExternalLink, Sparkles, MapPin, Check } from 'lucide-react';
import { getSculptureUrl } from '../utils/sculptureUtils';

export default function SculptureUnlockCard({ sculpture, isNewUnlock = false }) {
  const [imgError, setImgError] = useState(false);

  if (!sculpture) return null;

  const sculptureUrl = getSculptureUrl(sculpture.catalogId || sculpture.id);

  return (
    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/40 text-left relative overflow-hidden shadow-lg animate-fade-in">
      {/* Badge Superior */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
          <Landmark className="w-3 h-3 text-emerald-400" />
          <span>Patrimonio Escultórico Cercano</span>
        </span>
        {isNewUnlock ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full animate-bounce shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-300" />
            ¡Cromo Desbloqueado!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300/90 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>En tu Álbum • a {sculpture.distanceMeters}m</span>
          </span>
        )}
      </div>

      <div className="flex gap-3 items-center">
        {/* Foto de la Escultura con fallback */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/80 shadow-md flex items-center justify-center">
          {sculpture.imageUrl && !imgError ? (
            <img
              src={sculpture.imageUrl}
              alt={sculpture.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 p-1">
              <Landmark className="w-6 h-6 text-slate-600 mb-0.5" />
              <span className="text-[8px] font-bold text-slate-500">MUSEO</span>
            </div>
          )}
        </div>

        {/* Información Cultural */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <h4 className="text-sm sm:text-base font-heading font-black text-white truncate">
            {sculpture.title}
          </h4>
          <p className="text-xs text-emerald-300 font-medium truncate">
            Autor: {sculpture.artist} {sculpture.year ? `(${sculpture.year})` : ''}
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{sculpture.locationDescription || 'Casco Histórico de Resistencia'}</span>
          </p>
        </div>
      </div>

      {/* Enlace Oficial a la Fundación Urunday con URL canónica */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="text-slate-400">Museo a Cielo Abierto (Fundación Urunday)</span>
        <a
          href={sculptureUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
        >
          <span>Ficha Oficial</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
