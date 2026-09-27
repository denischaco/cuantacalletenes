import React from 'react';
import { X, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

function Instagram({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function CreditsModal({ onClose }) {
  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto animate-scale-up">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Heart className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
            <h3 className="font-heading font-black text-lg sm:text-xl text-white">
              Créditos & Agradecimientos
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjetas de Crédito */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
          {/* 1. Autoría */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-white text-sm">Idea, Diseño y Desarrollo</span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Autor</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Creado por <strong className="text-slate-200">Denis Giménez</strong> (@denischaco), desarrollador de software y creativo chaqueño.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://denischaco.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <span>denischaco.com.ar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.instagram.com/denischaco"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                <Instagram className="w-3 h-3" />
                <span>@denischaco</span>
              </a>
            </div>
          </div>

          {/* 2. Turismo Chaco */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-white text-sm">Apoyo Institucional & Difusión</span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Oficial</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Agradecimiento especial al equipo de <strong className="text-slate-200">Turismo Chaco</strong> por su acompañamiento para poner en valor la identidad y los atractivos de la provincia.
            </p>
            <a
              href="https://www.instagram.com/turismochaco/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold pt-1"
            >
              <Instagram className="w-3 h-3" />
              <span>@turismochaco</span>
            </a>
          </div>

          {/* 3. Fundación Urunday / Esculturas */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-white text-sm">Patrimonio Escultórico de Resistencia</span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Cultura</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Información de obras y esculturas basada en el catálogo oficial de <strong className="text-slate-200">Fundación Urunday</strong> y el Museo a Cielo Abierto.
            </p>
            <a
              href="https://museoacieloabierto.org/es/catalogo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold pt-1"
            >
              <span>museoacieloabierto.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 4. OpenStreetMap */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Datos viales: © Colaboradores de OpenStreetMap (ODbL)</span>
            <ShieldCheck className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* CTA Canal Oficial */}
        <div className="pt-2">
          <a
            href="https://www.instagram.com/cuantacalletenes"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all"
          >
            <Instagram className="w-4 h-4" />
            <span>Seguí la cuenta oficial: @cuantacalletenes</span>
          </a>
        </div>
      </div>
    </div>
  );
}
