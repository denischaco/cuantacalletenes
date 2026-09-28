import React from 'react';
import { X, HelpCircle, Eye, Compass, Award, ZoomIn, Landmark, Ticket, Zap, Swords } from 'lucide-react';

export default function HelpModal({ onClose }) {
  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white leading-tight">
                ¿Cómo se juega?
              </h3>
              <p className="text-[11px] text-slate-400">Reglas, novedades y mecánicas de juego</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Cerrar ayuda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step-by-step instructions (Scrollable) */}
        <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 overflow-y-auto pr-1 sm:pr-2 max-h-[calc(90vh-140px)]">
          {/* 1. Punto verde */}
          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 h-fit">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">1. Mirá el punto verde en el mapa</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                En cada una de las 5 rondas se señala una calle secreta en plena cuadra (lejos de esquinas para evitar ambigüedades).
              </p>
            </div>
          </div>

          {/* 2. Mapa mudo */}
          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 h-fit">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">2. El mapa no tiene nombres</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Hacé zoom y desplazate libremente. Orientate por la <span className="text-slate-200 font-semibold">Plaza 25 de Mayo</span>, avenidas diagonales y lagunas. Podés minimizar el panel con el botón <span className="text-cyan-300 font-medium">"Ver mapa"</span>.
              </p>
            </div>
          </div>

          {/* 3. Formas de adivinar */}
          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 h-fit">
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">3. Dos formas de adivinar</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed space-y-1">
                <span className="block">• <strong className="text-emerald-400">Escribir nombre exacto (+2 pts):</strong> con tildes y diéresis (ej: <em>Güemes</em>, <em>Julio A. Roca</em>).</span>
                <span className="block">• <strong className="text-amber-400">4 Opciones (+1 pt / -1 pt):</strong> elegí entre 4 alternativas de la zona (+1 si acertás, -1 si errás).</span>
              </p>
            </div>
          </div>

          {/* 4. Esculturas de Resistencia */}
          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 h-fit">
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">4. 🏛️ Coleccioná Esculturas de la Ciudad</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                ¡Resistencia es la <span className="text-purple-300 font-semibold">Capital Nacional de las Esculturas</span>! Al jugar vas desbloqueando obras patrimoniales con su autor, material, año e historia para completar tu álbum de 30 esculturas.
              </p>
            </div>
          </div>

          {/* 5. Cupones de descuento */}
          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0 h-fit">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">5. 🎟️ Comercios Amigos y Cupones Reales</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Si la calle es sede de un local auspiciante (ej: <em>Bacanal Burgers</em> o <em>La Fichita</em>), acertar te otorga un <span className="text-orange-300 font-semibold">cupón de descuento exclusivo</span> con ID único temporal antifraude y voucher HD descargable para usar en el mostrador.
              </p>
            </div>
          </div>

          {/* 6. GeoBoost 2x */}
          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 h-fit">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">6. ⚡ Multiplicador GeoBoost 2x</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                ¿Estás en el local comiendo o tomando algo? Si el juego detecta por GPS que estás a menos de 70 metros de un sponsor, ¡se activa el <span className="text-amber-300 font-semibold">GeoBoost 2x</span> y duplicás los puntos ganados en esa ronda!
              </p>
            </div>
          </div>

          {/* 7. Desafío 1v1 */}
          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0 h-fit">
              <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">7. ⚔️ Modo Desafío 1v1 Asincrónico</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Al finalizar tu partida, podés retar a amigos o familiares compartiendo tu enlace único por WhatsApp. Jugarán <span className="text-rose-300 font-semibold">exactamente tus mismas 5 calles</span> para ver quién tiene más calle.
              </p>
            </div>
          </div>

          {/* 8. Récord y Rango */}
          <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 h-fit">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">8. 🏆 Podio y Rango Chaqueño Oficial</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Alcanzá hasta 10 puntos (o más con GeoBoost), bajá tus segundos de juego y asegurá tu lugar en la tabla de récords según tu modalidad (<span className="text-slate-200">4 Avenidas</span> o <span className="text-slate-200">Gran Resistencia</span>).
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-2 shrink-0 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/50 hover:shadow-cyan-900/40"
          >
            ¡Entendido, a jugar!
          </button>
        </div>
      </div>
    </div>
  );
}
