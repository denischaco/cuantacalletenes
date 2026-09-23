import React, { useState } from 'react';
import { X, Megaphone, CheckCircle2, MessageSquare, Sparkles, Users } from 'lucide-react';
import { saveSponsorshipLead } from '../services/firebase';
import { trackSubmitLead } from '../services/analytics';
import sponsorPlansData from '../data/sponsorPlans.json';

const PLANS = sponsorPlansData.plans || sponsorPlansData;
const monthlyPlayers = sponsorPlansData.monthlyPlayers ?? 48;
const milestoneNotice = sponsorPlansData.milestoneNotice || 'Al llegar a 100, actualizaremos precios, publicitá antes';

export default function AdvertiseModal({ onClose }) {
  const [selectedPlanId, setSelectedPlanId] = useState('esquina_destacada');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Gastronomía / Bar / Hamburguesería');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[1];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!businessName.trim() || !whatsapp.trim()) {
      alert('Por favor completá el nombre de tu comercio y tu WhatsApp de contacto.');
      return;
    }

    setIsSubmitting(true);

    const leadData = {
      businessName: businessName.trim(),
      category,
      address: address.trim(),
      contactName: contactName.trim(),
      whatsapp: whatsapp.trim(),
      plan: `${selectedPlan.name} (${selectedPlan.price}${selectedPlan.period})`,
      notes: notes.trim()
    };

    const text = encodeURIComponent(
      `¡Hola Denis! 👋 Quiero sumar mi comercio a "¿Cuánta Calle Tenés?".\n\n` +
      `📍 *Comercio*: ${leadData.businessName}\n` +
      `🏷️ *Rubro*: ${leadData.category}\n` +
      `📌 *Ubicación*: ${leadData.address || 'Resistencia'}\n` +
      `👤 *Contacto*: ${leadData.contactName || 'Encargado'}\n` +
      `💼 *Plan de interés*: ${leadData.plan}\n\n` +
      `¿Coordinamos para armar el punto en el mapa?`
    );

    // Número directo de Denis: +543624625240
    const whatsappUrl = `https://wa.me/543624625240?text=${text}`;
    setLastWhatsAppUrl(whatsappUrl);

    // Tracking de conversión en Google Analytics
    trackSubmitLead(leadData);

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');

    try {
      await saveSponsorshipLead(leadData);
    } catch (err) {
      console.warn('Error guardando lead:', err);
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-6 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 sm:pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-[#F48138]/40 text-[#FFA559] text-[11px] font-bold uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5 text-[#F48138]" />
              <span>Capa Comercial B2B • Resistencia, Chaco</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
              Publicitá tu Comercio en el Mapa
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              No es un banner que la gente ignora: es <strong className="text-slate-200">atención activa</strong> de miles de chaqueños buscando tu esquina y <strong className="text-emerald-400">clientes reales</strong> entrando a tu local con cupones de descuento.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Pillars / Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-lg mb-1">🎯</div>
            <h4 className="text-xs font-bold text-white">Memoria Geográfica</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              15 a 20 segundos de atención visual exclusiva buscando tu manzana en el mapa.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-lg mb-1">🎟️</div>
            <h4 className="text-xs font-bold text-white">Cupones Geo-Activados</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Al acertar, el jugador desbloquea una promo exclusiva para consumir en tu caja.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-lg mb-1">🛡️</div>
            <h4 className="text-xs font-bold text-white">Exclusividad por Rubro</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Solo 1 comercio por rubro por zona comercial para garantizar máxima recordación.
            </p>
          </div>
        </div>

        {/* Pricing Audience Metric & Urgency Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Mensaje de Jugadores por Mes */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/40 text-left shadow-md shadow-emerald-950/20">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium leading-none mb-1">Tráfico y alcance</p>
              <h5 className="text-xs sm:text-sm font-heading font-black text-white">
                Actualmente <span className="text-emerald-400 font-extrabold">{monthlyPlayers}</span> jugadores por mes
              </h5>
            </div>
          </div>

          {/* Cuadro de Actualización de Precios / Urgencia */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#321401] to-slate-950/90 border border-[#F48138]/50 text-left shadow-md shadow-amber-950/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F48138]/15 border border-[#F48138]/40 text-[#FFA559] shrink-0 text-xl">
              🔥
            </div>
            <div>
              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#FFA559]">Tarifa de lanzamiento</span>
              <p className="text-xs font-semibold text-slate-200 leading-snug">
                {milestoneNotice}
              </p>
            </div>
          </div>
        </div>

        {/* Plans Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>1. Elegí tu Paquete Mensual:</span>
            <span className="text-[11px] text-[#FFA559] normal-case font-semibold">Sin contratos a largo plazo</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${plan.color
                    } ${isSelected
                      ? 'ring-2 ring-[#F48138] scale-[1.02]'
                      : 'opacity-85 hover:opacity-100 hover:border-slate-600'
                    }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-3 bg-[#F48138] text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-black text-sm text-white">
                        {plan.name}
                      </h4>
                    </div>

                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-lg font-black text-emerald-400">{plan.price}</span>
                      <span className="text-[10px] text-slate-400">{plan.period}</span>
                    </div>

                    <ul className="mt-2.5 space-y-1.5 text-[10px] text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-tight">
                          <CheckCircle2 className="w-3 h-3 text-[#F48138] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lead Capture Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Datos de tu Comercio:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nombre del Local / Marca *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej: Bacanal Burgers"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F48138]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rubro Comercial</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F48138]"
                >
                  <option value="Gastronomía / Bar / Hamburguesería">Gastronomía / Bar / Hamburguesería</option>
                  <option value="Cafetería / Confitería">Cafetería / Confitería</option>
                  <option value="Cervecería Artesanal">Cervecería Artesanal</option>
                  <option value="Indumentaria / Calzado">Indumentaria / Calzado</option>
                  <option value="Barbería / Peluquería / Estética">Barbería / Peluquería / Estética</option>
                  <option value="Gimnasio / Deportes">Gimnasio / Deportes</option>
                  <option value="Servicios / Concesionaria / Inmobiliaria">Servicios / Concesionaria / Inmobiliaria</option>
                  <option value="Otro Comercio">Otro Comercio</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Dirección o Esquina en Resistencia</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: French 683 / Güemes y Alvear"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F48138]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tu WhatsApp de Contacto *</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: 3624-123456"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F48138]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Tu Nombre o Encargado</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ej: Martín (Dueño)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F48138]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Consulta o Mensaje (Opcional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="¿Querés contarnos alguna promoción especial o cuándo te gustaría arrancar?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F48138] resize-none"
                />
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-[#339136] to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-heading font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 border border-emerald-400/40 cursor-pointer transition-transform active:scale-98 disabled:opacity-50"
              >
                <MessageSquare className="w-5 h-5 fill-white" />
                <span>Enviar y Chatear por WhatsApp</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-700/70 text-center space-y-3 animate-fade-in">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 text-2xl mb-1">
              ✓
            </div>
            <h3 className="text-lg font-heading font-black text-white">
              ¡Conversación Iniciada con Denis!
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Registramos a <strong>{businessName}</strong> para el plan <strong>{selectedPlan.name}</strong>. Se abrió una ventana de WhatsApp para coordinar tu comercio.
            </p>
            {lastWhatsAppUrl && (
              <div>
                <a
                  href={lastWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Reabrir Chat de WhatsApp</span>
                </a>
              </div>
            )}
            <div>
              <button
                onClick={onClose}
                className="mt-2 py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Volver al Juego
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
