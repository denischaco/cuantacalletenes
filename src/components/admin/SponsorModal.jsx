import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  MapPin,
  Tag,
  Calendar,
  Lock,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  Navigation
} from 'lucide-react';

export default function SponsorModal({ isOpen, onClose, onSave, sponsorToEdit }) {
  const isEditing = Boolean(sponsorToEdit?.id);

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'location' | 'coupon'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    shortName: '',
    rubro: 'Gastronomía / Bar',
    plan: 'sponsor_zona',
    active: true,
    ownerPin: '1984',
    expiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
    address: '',
    zoneId: 'centro',
    lat: -27.45105,
    lng: -58.98648,
    targetStreetName: '',
    targetStreetAliases: '',
    badge: '',
    logoBg: '#FFFFFF',
    // Cupón
    couponActive: true,
    couponTitle: '15% OFF en tu Consumo',
    couponDiscount: '15% OFF',
    couponCode: '',
    couponValidityHours: 48,
    couponScope: 'individual',
    couponScopeLabel: 'Por persona / Comensal individual',
    couponPaymentMethods: 'Efectivo, Transferencia bancaria',
    couponTerms: 'Presentar la captura en caja antes de pedir la cuenta.\nNo acumulable con otras promociones.'
  });

  // Inicializar formulario al abrir
  useEffect(() => {
    if (sponsorToEdit) {
      setFormData({
        id: sponsorToEdit.id || '',
        name: sponsorToEdit.name || '',
        shortName: sponsorToEdit.shortName || sponsorToEdit.name || '',
        rubro: sponsorToEdit.rubro || 'Gastronomía / Bar',
        plan: sponsorToEdit.plan || 'sponsor_zona',
        active: sponsorToEdit.active !== undefined ? Boolean(sponsorToEdit.active) : true,
        ownerPin: sponsorToEdit.ownerPin || '1984',
        expiresAt: sponsorToEdit.expiresAt
          ? new Date(sponsorToEdit.expiresAt).toISOString().split('T')[0]
          : new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
        address: sponsorToEdit.address || '',
        zoneId: sponsorToEdit.zoneId || 'centro',
        lat: sponsorToEdit.coordinates?.[0] || -27.45105,
        lng: sponsorToEdit.coordinates?.[1] || -58.98648,
        targetStreetName: sponsorToEdit.targetStreet?.name || sponsorToEdit.address || '',
        targetStreetAliases: sponsorToEdit.targetStreet?.aliases?.join(', ') || '',
        badge: sponsorToEdit.badge || '',
        logoBg: sponsorToEdit.logoBg || '#FFFFFF',
        // Cupón
        couponActive: sponsorToEdit.coupon?.active !== false,
        couponTitle: sponsorToEdit.coupon?.title || '15% OFF en tu Consumo',
        couponDiscount: sponsorToEdit.coupon?.discount || '15% OFF',
        couponCode: sponsorToEdit.coupon?.code || `CALLE-${(sponsorToEdit.id || 'SPONSOR').toUpperCase()}`,
        couponValidityHours: sponsorToEdit.coupon?.validityHours || 48,
        couponScope: sponsorToEdit.coupon?.scope || 'individual',
        couponScopeLabel: sponsorToEdit.coupon?.scopeLabel || 'Por persona / Comensal individual',
        couponPaymentMethods: Array.isArray(sponsorToEdit.coupon?.paymentMethods)
          ? sponsorToEdit.coupon.paymentMethods.join(', ')
          : 'Efectivo, Transferencia bancaria',
        couponTerms: Array.isArray(sponsorToEdit.coupon?.terms)
          ? sponsorToEdit.coupon.terms.join('\n')
          : 'Presentar la captura en caja antes de pedir la cuenta.\nNo acumulable con otras promociones.'
      });
    } else {
      // Nuevo Sponsor con valores iniciales limpios
      setFormData({
        id: '',
        name: '',
        shortName: '',
        rubro: 'Gastronomía / Hamburguesería',
        plan: 'sponsor_zona',
        active: true,
        ownerPin: '1234',
        expiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
        address: 'Pellegrini 200',
        zoneId: 'centro',
        lat: -27.45105,
        lng: -58.98648,
        targetStreetName: 'Calle Pellegrini 200',
        targetStreetAliases: 'pellegrini, calle pellegrini',
        badge: '',
        logoBg: '#FFFFFF',
        couponActive: true,
        couponTitle: '15% OFF en tu Consumo',
        couponDiscount: '15% OFF',
        couponCode: 'CALLE-NUEVO',
        couponValidityHours: 48,
        couponScope: 'individual',
        couponScopeLabel: 'Por persona / Comensal individual',
        couponPaymentMethods: 'Efectivo, Transferencia bancaria',
        couponTerms: 'Presentar la captura en caja antes de pedir la cuenta.\nNo acumulable con otras promociones.'
      });
    }
    setActiveTab('general');
    setError('');
  }, [sponsorToEdit, isOpen]);

  if (!isOpen) return null;

  // Autogenerar slug de ID desde el nombre si es nuevo
  const handleNameChange = (newName) => {
    const updates = { name: newName };
    if (!isEditing && (!formData.id || formData.id === slugify(formData.name))) {
      const slug = slugify(newName);
      updates.id = slug;
      updates.shortName = newName.split(' ')[0] || newName;
      updates.couponCode = `CALLE-${slug.toUpperCase()}`;
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const slugify = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Helper para sumar 90 días a la fecha
  const handleAdd90Days = () => {
    const current = formData.expiresAt ? new Date(formData.expiresAt) : new Date();
    const base = current > new Date() ? current : new Date();
    const next = new Date(base.getTime() + 90 * 24 * 3600 * 1000);
    setFormData(prev => ({ ...prev, expiresAt: next.toISOString().split('T')[0] }));
  };

  // Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('El nombre del comercio es obligatorio.');
      setActiveTab('general');
      return;
    }

    if (!formData.id.trim()) {
      setError('El identificador (ID) del comercio es obligatorio.');
      setActiveTab('general');
      return;
    }

    if (formData.ownerPin && formData.ownerPin.length !== 4) {
      setError('El PIN del dueño debe contener exactamente 4 dígitos.');
      setActiveTab('general');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const paymentMethodsList = formData.couponPaymentMethods
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const termsList = formData.couponTerms
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const aliasesList = formData.targetStreetAliases
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        id: slugify(formData.id),
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || formData.name.trim(),
        rubro: formData.rubro.trim(),
        plan: formData.plan,
        active: Boolean(formData.active),
        ownerPin: formData.ownerPin || '1984',
        expiresAt: new Date(formData.expiresAt).toISOString(),
        address: formData.address.trim(),
        zoneId: formData.zoneId,
        coordinates: [Number(formData.lat), Number(formData.lng)],
        badge: formData.badge.trim(),
        logoBg: formData.logoBg || '#FFFFFF',
        targetStreet: {
          id: `${slugify(formData.id)}-target`,
          name: formData.targetStreetName.trim() || formData.address.trim(),
          shortStreet: formData.targetStreetName.trim().replace(/^\s*calle\s+/i, '') || formData.address.trim(),
          number: '',
          aliases: aliasesList.length > 0 ? aliasesList : [slugify(formData.id), (formData.shortName || '').toLowerCase()]
        },
        coupon: {
          active: Boolean(formData.couponActive),
          title: formData.couponTitle.trim(),
          discount: formData.couponDiscount.trim(),
          code: formData.couponCode.trim().toUpperCase() || `CALLE-${slugify(formData.id).toUpperCase()}`,
          validityHours: Number(formData.couponValidityHours) || 48,
          scope: formData.couponScope,
          scopeLabel: formData.couponScopeLabel.trim(),
          paymentMethods: paymentMethodsList.length > 0 ? paymentMethodsList : ['Efectivo', 'Transferencia bancaria'],
          terms: termsList.length > 0 ? termsList : ['Presentar la captura en caja antes de pedir la cuenta.'],
          instructions: 'Mostrá tu cupón digital con tu ID único en caja al pedir la cuenta.',
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${formData.lat},${formData.lng}`
        }
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setError('Error guardando sponsor: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-white text-base sm:text-lg">
                {isEditing ? `Editar: ${sponsorToEdit.name}` : 'Crear Nuevo Sponsor Comercial'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Gestión Superadmin Root (Denis) • Visibilidad en mapa y cupones
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-[#F48138] text-[#F48138]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>1. Datos Comerciales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'border-[#F48138] text-[#F48138]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>2. Ubicación & Mapa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coupon')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'coupon'
                ? 'border-[#F48138] text-[#F48138]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>3. Beneficio / Cupón</span>
          </button>
        </div>

        {/* Formulario Scrolleable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: DATOS COMERCIALES */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Nombre Oficial del Comercio *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="ej: Bacanal Burgers"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Nombre Corto (Visual en Juego)</label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="ej: Bacanal"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">ID / Slug *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: slugify(e.target.value) })}
                    placeholder="ej: bacanal"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#F48138] disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Rubro Comercial</label>
                  <input
                    type="text"
                    value={formData.rubro}
                    onChange={(e) => setFormData({ ...formData, rubro: e.target.value })}
                    placeholder="ej: Gastronomía / Burgers"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Plan Comercial</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  >
                    <option value="sponsor_zona">Sponsor de Zona (Barrio)</option>
                    <option value="esquina_destacada">Esquina Destacada</option>
                    <option value="sponsor_oro">Sponsor Platino / Oro</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Switch Activo */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-white">Estado del Sponsor</span>
                    <span className="text-[10px] text-slate-400">Visible en mapa y canjes</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      formData.active ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        formData.active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* PIN del Dueño */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <label className="block uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>PIN de Dueño (4 dígitos)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.ownerPin}
                    onChange={(e) => setFormData({ ...formData, ownerPin: e.target.value.replace(/\D/g, '') })}
                    placeholder="1984"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Vencimiento */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block uppercase font-bold text-slate-400">Vencimiento</label>
                    <button
                      type="button"
                      onClick={handleAdd90Days}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                    >
                      +90 Días
                    </button>
                  </div>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>
              </div>

              {/* Logo y Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">URL del Logo / Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="ej: /sponsors/bacanal.png o https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Color de Fondo del Logo (HEX)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.logoBg || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, logoBg: e.target.value })}
                      className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={formData.logoBg}
                      onChange={(e) => setFormData({ ...formData, logoBg: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F48138]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UBICACIÓN & MAPA (RESISTENCIA) */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Dirección Física en Resistencia *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="ej: French 683"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Zona de Cobertura en Juego</label>
                  <select
                    value={formData.zoneId}
                    onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  >
                    <option value="centro">Centro (4 Avenidas de Resistencia)</option>
                    <option value="toda_ciudad">Gran Resistencia (Toda la Ciudad)</option>
                  </select>
                </div>
              </div>

              {/* Coordenadas GPS */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-[#F48138]" />
                    <span>Coordenadas Geográficas (Lat / Lng)</span>
                  </span>
                  <div className="flex gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, lat: -27.448863, lng: -58.977195 })}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      French
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, lat: -27.452144, lng: -58.984264 })}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Pellegrini
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, lat: -27.45105, lng: -58.98648 })}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Plaza 25
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Latitud</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#F48138]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Longitud</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#F48138]"
                    />
                  </div>
                </div>
              </div>

              {/* Calle Objetivo para Ronda de Juego */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">
                    Nombre de Calle / Esquina del Juego
                  </label>
                  <input
                    type="text"
                    value={formData.targetStreetName}
                    onChange={(e) => setFormData({ ...formData, targetStreetName: e.target.value })}
                    placeholder="ej: Calle French 683"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">
                    Aliases de Búsqueda (Separados por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.targetStreetAliases}
                    onChange={(e) => setFormData({ ...formData, targetStreetAliases: e.target.value })}
                    placeholder="ej: french, calle french, french 683, bacanal"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F48138]"
                  />
                  <span className="text-[10px] text-slate-500">
                    Permite que el jugador reconozca la esquina al adivinar en la ronda urbana.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BENEFICIO & CUPÓN */}
          {activeTab === 'coupon' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white">Beneficio / Cupón Digital</span>
                  <span className="text-[10px] text-slate-400">Permite a los jugadores desbloquear y canjear promos</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, couponActive: !formData.couponActive })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    formData.couponActive ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      formData.couponActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Título de la Promoción</label>
                  <input
                    type="text"
                    value={formData.couponTitle}
                    onChange={(e) => setFormData({ ...formData, couponTitle: e.target.value })}
                    placeholder="ej: 15% OFF en tu Burger"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Texto Destacado (Descuento)</label>
                  <input
                    type="text"
                    value={formData.couponDiscount}
                    onChange={(e) => setFormData({ ...formData, couponDiscount: e.target.value })}
                    placeholder="ej: 15% OFF"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Código Promo</label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="CALLE-PROMO"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Validez (Horas)</label>
                  <select
                    value={formData.couponValidityHours}
                    onChange={(e) => setFormData({ ...formData, couponValidityHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  >
                    <option value={24}>24 Horas (1 día)</option>
                    <option value={48}>48 Horas (2 días)</option>
                    <option value={72}>72 Horas (3 días)</option>
                    <option value={168}>168 Horas (1 semana)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block uppercase font-bold text-slate-400">Alcance</label>
                  <input
                    type="text"
                    value={formData.couponScopeLabel}
                    onChange={(e) => setFormData({ ...formData, couponScopeLabel: e.target.value })}
                    placeholder="ej: Por persona"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block uppercase font-bold text-slate-400">Medios de Pago Admitidos</label>
                <input
                  type="text"
                  value={formData.couponPaymentMethods}
                  onChange={(e) => setFormData({ ...formData, couponPaymentMethods: e.target.value })}
                  placeholder="Efectivo, Transferencia bancaria, Débito"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F48138]"
                />
              </div>

              <div className="space-y-1">
                <label className="block uppercase font-bold text-slate-400">Términos y Condiciones (uno por línea)</label>
                <textarea
                  rows={3}
                  value={formData.couponTerms}
                  onChange={(e) => setFormData({ ...formData, couponTerms: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F48138]"
                />
              </div>
            </div>
          )}

          {/* Pie de Acciones del Modal */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-orange-950/40 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{saving ? 'Guardando en la nube...' : isEditing ? 'Guardar Cambios' : 'Crear Sponsor Oficial'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
