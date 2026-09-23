import React from 'react';
import { X, HelpCircle, Eye, Compass, Award, ZoomIn } from 'lucide-react';

export default function HelpModal({ onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <HelpCircle className="w-5 h-5" />
            <h3 className="font-heading font-black text-lg text-white">
              ¿Cómo se juega?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step-by-step instructions */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 h-fit">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">1. Mirá el punto verde en el mapa</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                En cada ronda se marca un punto sobre una calle en plena cuadra (lejos de esquinas e intersecciones).
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 h-fit">
              <Eye className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">2. El mapa no tiene nombres</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Hacé zoom y desplazate libremente. Orientate por la <span className="text-slate-200 font-semibold">Plaza 25 de Mayo</span>, avenidas diagonales y lagunas. Podés minimizar el panel con el botón "Ver mapa".
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 h-fit">
              <ZoomIn className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">3. Dos formas de adivinar</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                • <strong className="text-emerald-400">Escribir nombre (+2 pts):</strong> nombre exacto respetando tildes y diéresis (ej: <em>Güemes</em>, <em>Julio A. Roca</em>).<br/>
                • <strong className="text-amber-400">4 Opciones (+1 pt / -1 pt):</strong> elegí entre 4 alternativas (+1 pt si acertás, -1 pt si errás).
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 h-fit">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">4. Sumá hasta 10 puntos y ganá tu Rango</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Completá las 5 rondas para obtener tu <span className="text-purple-300 font-semibold">Rango Chaqueño</span> oficial y guardar tu récord en la tabla.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-colors"
        >
          ¡Entendido, a jugar!
        </button>
      </div>
    </div>
  );
}
