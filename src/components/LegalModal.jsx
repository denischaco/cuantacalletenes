import React, { useState } from 'react';
import { X, ShieldCheck, Scale, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export default function LegalModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'privacy' | 'traffic'

  return (
    <div className="absolute inset-0 z-[2100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Scale className="w-5 h-5 text-[#F48138]" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white leading-tight">
                Términos y Privacidad
              </h3>
              <p className="text-[11px] text-slate-400">Ley 25.326 & Descargo de Seguridad Vial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar legales"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-[#339136] to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Términos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-[#F48138] to-[#B95D0E] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacidad (Ley 25.326)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('traffic')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'traffic'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Seguridad Vial</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="space-y-3 text-xs text-slate-300 overflow-y-auto pr-1 sm:pr-2 max-h-[calc(90vh-170px)] leading-relaxed">
          {activeTab === 'terms' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#339136]" />
                  <span>1. Propósito y Naturaleza del Servicio</span>
                </h4>
                <p className="text-slate-400">
                  <strong>"¿Cuánta Calle Tenés?"</strong> es una plataforma lúdica, cultural e interactiva desarrollada con el objetivo de fomentar el conocimiento de la traza urbana, historia y patrimonio artístico de la ciudad de Resistencia, Chaco.
                </p>
                <p className="text-slate-400">
                  El acceso y uso de la aplicación es completamente gratuito y abierto a toda la comunidad.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F48138]" />
                  <span>2. Beneficios Comerciales & Cupones</span>
                </h4>
                <p className="text-slate-400">
                  Los cupones y beneficios promocionales ofrecidos por comercios amigos (ej: Bacanal Burgers, La Fichita Bar) son emitidos por los respectivos establecimientos auspiciantes.
                </p>
                <p className="text-slate-400">
                  Cada cupón cuenta con un código e identificador temporal de sesión. Su canje efectivo está sujeto a los términos particulares, días, horarios y modalidades de pago definidas por cada comercio.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FFA559]" />
                  <span>3. Propiedad Intelectual</span>
                </h4>
                <p className="text-slate-400">
                  La mecánica de juego, código fuente, diseño gráfico y recopilación de hitos chaqueños pertenecen a su creador (Denis Gómez - <em>denischaco.com.ar</em>). Las marcas registradas y logos de comercios pertenecen a sus respectivos titulares.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1.5">
                <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cumplimiento Ley N° 25.326 (Protección de Datos Personales)</span>
                </h4>
                <p className="text-slate-300">
                  El titular del sitio garantiza la protección integral de los datos personales en estricta conformidad con la <strong>Ley 25.326 de la República Argentina</strong> y sus normas complementarias.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <h4 className="font-bold text-white text-sm">📍 Privacidad de Geolocalización (GeoBoost 2x)</h4>
                <p className="text-slate-400">
                  <strong className="text-emerald-400">Procesamiento 100% Local:</strong> Cuando activás la opción de comprobación de cercanía (GeoBoost 2x), las coordenadas satelitales obtenidas por tu navegador se comparan únicamente dentro de la memoria de tu dispositivo.
                </p>
                <p className="text-slate-400 font-semibold text-emerald-300">
                  🔒 Tus coordenadas GPS nunca se transmiten, registran ni almacenan en ningún servidor ni base de datos externa.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <h4 className="font-bold text-white text-sm">💾 Almacenamiento Local (LocalStorage y Cookies)</h4>
                <p className="text-slate-400">
                  Utilizamos almacenamiento local del navegador únicamente para mantener tu progreso en el álbum de esculturas, tus cupones activos de sesión y el récord local de tus partidas.
                </p>
                <p className="text-slate-400">
                  Se recopilan estadísticas anónimas agregadas mediante Google Analytics 4 para el diagnóstico de errores técnicos y optimización de carga móvil.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'traffic' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/50 space-y-2 text-rose-200">
                <div className="flex items-center gap-2 font-heading font-black text-base text-rose-300">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>Aviso Crucial de Seguridad Vial</span>
                </div>
                <p className="leading-relaxed font-semibold">
                  ⚠️ No juegues mientras conducís ningún tipo de vehículo (auto, moto, bicicleta o monopatín).
                </p>
                <p className="leading-relaxed">
                  ⚠️ No cruces la calle distraído mirando la pantalla de tu smartphone. Mantené siempre la atención en el entorno urbano y respetá las señales y semáforos de Resistencia.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <h4 className="font-bold text-white text-sm">Deslinde de Responsabilidad</h4>
                <p className="text-slate-400">
                  El creador y auspiciantes de "¿Cuánta Calle Tenés?" no asumen ninguna responsabilidad por incidentes, contravenciones o accidentes ocasionados por el uso imprudente o negligente de la aplicación en la vía pública.
                </p>
                <p className="text-slate-400">
                  Priorizá siempre tu seguridad y la de los demás peatones y conductores.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="pt-2 shrink-0 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Resistencia, Chaco • Ley 25.326</span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
