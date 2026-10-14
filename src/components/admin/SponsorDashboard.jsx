import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  TrendingUp,
  Search,
  Sparkles,
  QrCode,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Store,
  DollarSign,
  ChevronRight,
  Send
} from 'lucide-react';
import PinModal from './PinModal';
import {
  getCouponById,
  redeemCoupon,
  subscribeSponsorCoupons,
  updateSponsorCoupon
} from '../../services/firebase';

export default function SponsorDashboard({ sponsor, onLogout, initialRedeemCode = '' }) {
  const [activeTab, setActiveTab] = useState('redeem'); // 'redeem' | 'stats' | 'settings'
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Validación de cupones
  const [couponSearchInput, setCouponSearchInput] = useState(initialRedeemCode || '');
  const [searchingCoupon, setSearchingCoupon] = useState(false);
  const [searchedCoupon, setSearchedCoupon] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');

  // Estadísticas y cupones en tiempo real
  const [statsData, setStatsData] = useState({
    totalGenerated: 0,
    totalRedeemed: 0,
    pendingCount: 0,
    conversionRate: '0',
    coupons: []
  });

  // Configuración de Cupón
  const [couponForm, setCouponForm] = useState({
    active: sponsor?.coupon?.active !== false,
    title: sponsor?.coupon?.title || '',
    discount: sponsor?.coupon?.discount || '15% OFF',
    validityHours: sponsor?.coupon?.validityHours || 48,
    scopeLabel: sponsor?.coupon?.scopeLabel || 'Por persona / Comensal individual',
    paymentMethods: sponsor?.coupon?.paymentMethods?.join(', ') || 'Efectivo, Transferencia',
    termsText: sponsor?.coupon?.terms?.join('\n') || ''
  });
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Escuchar cupones en tiempo real
  useEffect(() => {
    if (!sponsor?.id) return;
    const unsub = subscribeSponsorCoupons(sponsor.id, (data) => {
      setStatsData(data);
    });
    return () => unsub();
  }, [sponsor?.id]);

  // Si viene con initialRedeemCode (Deep Link) se busca automáticamente
  useEffect(() => {
    if (initialRedeemCode) {
      handleSearchCoupon(initialRedeemCode);
    }
  }, [initialRedeemCode]);

  // Cálculo de Habilitación / Días restantes
  const subscriptionStatus = useMemo(() => {
    if (!sponsor?.expiresAt) {
      return { daysLeft: 90, status: 'active', formattedDate: '3 meses activos' };
    }
    const expDate = new Date(sponsor.expiresAt);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      daysLeft,
      isExpired: daysLeft <= 0,
      isExpiringSoon: daysLeft > 0 && daysLeft <= 15,
      formattedDate: expDate.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    };
  }, [sponsor?.expiresAt]);

  // Buscar cupón
  const handleSearchCoupon = async (codeToSearch) => {
    const code = (codeToSearch || couponSearchInput).trim();
    if (!code) return;

    if (codeToSearch) {
      setCouponSearchInput(codeToSearch);
    }

    setSearchingCoupon(true);
    setSearchError('');
    setSearchedCoupon(null);
    setRedeemSuccessMsg('');

    try {
      const result = await getCouponById(code);
      if (result) {
        // Verificar si pertenece a este sponsor
        if (result.sponsorId && result.sponsorId !== sponsor.id) {
          setSearchError(`Este cupón corresponde a otro comercio (${result.sponsorName || result.sponsorId}). No es válido para ser canjeado en ${sponsor.shortName || sponsor.name}.`);
          setSearchedCoupon(null);
          return;
        }

        // Verificar si está expirado
        const now = new Date();
        if (result.expiresAt && new Date(result.expiresAt) < now) {
          setSearchError(`Este cupón venció el ${new Date(result.expiresAt).toLocaleString('es-AR')}. Ya no es válido para canje.`);
          setSearchedCoupon(result);
          return;
        }

        setSearchedCoupon(result);
      } else {
        setSearchError('No se encontró ningún cupón con ese ID en el sistema.');
      }
    } catch (err) {
      setSearchError('Error al consultar el cupón: ' + err.message);
    } finally {
      setSearchingCoupon(false);
    }
  };

  // Confirmar canje
  const handleConfirmRedeem = async () => {
    if (!searchedCoupon?.id) return;

    if (searchedCoupon.sponsorId && searchedCoupon.sponsorId !== sponsor.id) {
      setSearchError(`Operación bloqueada: Este cupón pertenece a ${searchedCoupon.sponsorName || searchedCoupon.sponsorId}.`);
      return;
    }

    setRedeeming(true);
    setRedeemSuccessMsg('');
    setSearchError('');

    try {
      const res = await redeemCoupon(searchedCoupon.id, `${sponsor.shortName || sponsor.name} (Salón)`, sponsor.id);
      if (res.success) {
        setRedeemedCouponState(res.coupon);
        setRedeemSuccessMsg('¡Cupón canjeado exitosamente en el sistema!');
      } else {
        setSearchError(res.error || 'No se pudo realizar el canje.');
      }
    } catch (err) {
      setSearchError('Error en canje: ' + err.message);
    } finally {
      setRedeeming(false);
    }
  };

  const setRedeemedCouponState = (updatedCoupon) => {
    setSearchedCoupon(updatedCoupon);
  };

  // Guardar configuración de cupón (Modo Dueño)
  const handleSaveCouponSettings = async (e) => {
    e.preventDefault();
    if (!isUnlocked) {
      setIsPinModalOpen(true);
      return;
    }

    setSavingCoupon(true);
    setSaveSuccessMsg('');

    const updatedCoupon = {
      active: couponForm.active,
      title: couponForm.title.trim(),
      discount: couponForm.discount.trim(),
      code: sponsor?.coupon?.code || `CALLE-${sponsor.id.toUpperCase()}`,
      validityHours: Number(couponForm.validityHours) || 48,
      scope: 'individual',
      scopeLabel: couponForm.scopeLabel.trim(),
      paymentMethods: couponForm.paymentMethods.split(',').map(m => m.trim()).filter(Boolean),
      terms: couponForm.termsText.split('\n').map(t => t.trim()).filter(Boolean),
      instructions: `Mostrá este cupón en ${sponsor.address} para validar tu descuento.`,
      googleMapsUrl: sponsor?.coupon?.googleMapsUrl || ''
    };

    try {
      await updateSponsorCoupon(sponsor.id, updatedCoupon, sponsor.name);
      setSaveSuccessMsg('¡Promoción y condiciones actualizadas exitosamente en el juego!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert('Error guardando cambios: ' + err.message);
    } finally {
      setSavingCoupon(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-32">
      {/* Barra Superior */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo y Nombre del Sponsor */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{ backgroundColor: sponsor.logoBg || '#FFFFFF' }}
              className="w-10 h-10 rounded-xl p-1 border border-[#F48138]/40 shadow flex items-center justify-center shrink-0 overflow-hidden"
            >
              {sponsor.badge ? (
                <img src={sponsor.badge} alt={sponsor.name} className="w-full h-full object-contain" />
              ) : (
                <Store className="w-5 h-5 text-slate-800" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-heading font-black text-white text-sm sm:text-base truncate">
                  {sponsor.name}
                </h1>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold shrink-0">
                  Sponsor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {sponsor.address} • Resistencia
              </p>
            </div>
          </div>

          {/* Acciones: Candado y Salir */}
          <div className="flex items-center gap-2">
            {/* Botón Candado (Seguridad Dueño vs Mozo) */}
            <button
              type="button"
              onClick={() => {
                if (isUnlocked) {
                  setIsUnlocked(false);
                } else {
                  setIsPinModalOpen(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isUnlocked
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shadow-sm'
              }`}
              title={isUnlocked ? 'Modo Dueño Activo - Clic para bloquear' : 'Modo Salón - Clic para desbloquear edición'}
            >
              {isUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modo Dueño</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modo Salón</span>
                </>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto w-full px-4 pt-4 space-y-4">
        {/* Tarjeta de Habilitación / Suscripción (3 Meses) */}
        <div className={`p-4 rounded-2xl border shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          subscriptionStatus.isExpired
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            : subscriptionStatus.isExpiringSoon
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
            : 'bg-gradient-to-r from-slate-900 to-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              subscriptionStatus.isExpired
                ? 'bg-rose-500/20 text-rose-400'
                : subscriptionStatus.isExpiringSoon
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Habilitación Comercial</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  subscriptionStatus.isExpired
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {subscriptionStatus.isExpired ? 'Vencido' : 'Activo'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white">
                {subscriptionStatus.isExpired
                  ? 'Tu suscripción ha finalizado. Contactá al soporte para renovar.'
                  : `Válido hasta el ${subscriptionStatus.formattedDate} (${subscriptionStatus.daysLeft} días restantes)`}
              </p>
            </div>
          </div>

          {/* Botón rápido si vence pronto */}
          {subscriptionStatus.isExpiringSoon && (
            <a
              href="https://wa.me/5493624000000?text=Hola%20Denis,%20queremos%20renovar%20el%20sponsoreo%20en%20CuantaCalle"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:bg-amber-400 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Solicitar Renovación</span>
            </a>
          )}
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-800 gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('redeem')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'redeem'
                ? 'border-[#F48138] text-[#F48138]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Validar Canje (Caja)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'border-[#F48138] text-[#F48138]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Reportes ({statsData.totalRedeemed})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-[#F48138] text-[#F48138]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isUnlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
            <span>Configurar Promo</span>
          </button>
        </div>

        {/* TAB 1: VALIDAR CANJE (MOZO / CAJA) */}
        {activeTab === 'redeem' && (
          <div className="space-y-4">
            {/* Buscador de Cupón por ID */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
                Ingresá o escaneá el ID del cupón del cliente:
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponSearchInput}
                    onChange={(e) => setCouponSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchCoupon()}
                    placeholder="Ej: 261014-1030-4821 o escaneá QR"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#F48138]"
                  />
                  {couponSearchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCouponSearchInput('');
                        setSearchedCoupon(null);
                        setSearchError('');
                        setRedeemSuccessMsg('');
                      }}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSearchCoupon()}
                  disabled={searchingCoupon || !couponSearchInput.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50 transition-all shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{searchingCoupon ? 'Buscando...' : 'Verificar'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>💡 Tip para salón: Podés apuntar la cámara del celular al código QR del cliente para abrirlo directamente.</span>
              </p>
            </div>

            {/* Error en la búsqueda */}
            {searchError && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Aviso del sistema:</p>
                  <p>{searchError}</p>
                </div>
              </div>
            )}

            {/* Éxito de canje */}
            {redeemSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-sm">{redeemSuccessMsg}</p>
                  <p className="text-xs text-emerald-400/80">El beneficio ha sido registrado en caja.</p>
                </div>
              </div>
            )}

            {/* Ficha del Cupón Encontrado */}
            {searchedCoupon && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                {/* Estado del Cupón */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">ID del Cupón</span>
                    <span className="font-mono font-black text-lg text-white">{searchedCoupon.id}</span>
                  </div>

                  <div>
                    {searchedCoupon.status === 'redeemed' ? (
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Ya Canjeado</span>
                      </span>
                    ) : searchedCoupon.expiresAt && new Date(searchedCoupon.expiresAt) < new Date() ? (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cupón Vencido</span>
                      </span>
                    ) : searchedCoupon.sponsorId && searchedCoupon.sponsorId !== sponsor.id ? (
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Otro Comercio</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Válido para Canje</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Beneficio */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-xs uppercase font-bold text-slate-400">{searchedCoupon.sponsorName}</span>
                  <div className="text-3xl font-heading font-black text-emerald-400">{searchedCoupon.discount}</div>
                  <p className="text-sm font-bold text-slate-200">{searchedCoupon.title}</p>
                </div>

                {/* Fechas y Alcance */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Emitido</span>
                    <span className="text-slate-200 font-medium">
                      {new Date(searchedCoupon.issuedAt).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Válido hasta</span>
                    <span className="text-amber-300 font-bold">
                      {new Date(searchedCoupon.expiresAt).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Si ya fue canjeado, datos del canje */}
                {searchedCoupon.status === 'redeemed' && (
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Registrado como canjeado el:</span>
                    </p>
                    <p className="font-mono pl-5">
                      {new Date(searchedCoupon.redeemedAt).toLocaleString('es-AR')} ({searchedCoupon.redeemedBy || 'Caja'})
                    </p>
                  </div>
                )}

                {/* Botón de Canjear (Solo disponible si pertenece a este comercio y está vigente) */}
                {searchedCoupon.status !== 'redeemed' &&
                 !(searchedCoupon.expiresAt && new Date(searchedCoupon.expiresAt) < new Date()) &&
                 !(searchedCoupon.sponsorId && searchedCoupon.sponsorId !== sponsor.id) && (
                  <button
                    type="button"
                    onClick={handleConfirmRedeem}
                    disabled={redeeming}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-heading font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer transition-all active:scale-98"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{redeeming ? 'Registrando canje...' : 'CONFIRMAR CANJE EN LOCAL'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REPORTES Y MÉTRICAS */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Cupones Emitidos</span>
                <div className="text-2xl font-heading font-black text-white">{statsData.totalGenerated}</div>
                <p className="text-[10px] text-slate-400">Desbloqueados en juego</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Canjeados en Local</span>
                <div className="text-2xl font-heading font-black text-emerald-400">{statsData.totalRedeemed}</div>
                <p className="text-[10px] text-slate-400">Clientes en el salón</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#FFA559]">Tasa Conversión</span>
                <div className="text-2xl font-heading font-black text-[#FFA559]">{statsData.conversionRate}%</div>
                <p className="text-[10px] text-slate-400">Efectividad de campaña</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400">Pendientes</span>
                <div className="text-2xl font-heading font-black text-amber-400">{statsData.pendingCount}</div>
                <p className="text-[10px] text-slate-400">Aún dentro del plazo</p>
              </div>
            </div>

            {/* Listado de Últimos Canjes */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-heading font-black text-white text-sm">Historial de Cupones Emitidos</h3>
              {statsData.coupons.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Aún no se han emitido cupones en partidas recientes.
                </p>
              ) : (
                <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
                  {statsData.coupons.map((c) => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-white block">{c.id}</span>
                        <span className="text-[11px] text-slate-400">
                          Emitido: {new Date(c.issuedAt).toLocaleDateString('es-AR')} {new Date(c.issuedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                        </span>
                      </div>
                      <div>
                        {c.status === 'redeemed' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                            Canjeado {new Date(c.redeemedAt).toLocaleDateString('es-AR')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CONFIGURAR PROMO (PROTEGIDO POR CANDADO) */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Aviso de Modo Salón vs Modo Dueño */}
            {!isUnlocked ? (
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 text-amber-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">Panel de configuración bloqueado</p>
                    <p className="text-slate-400">Para evitar modificaciones accidentales en el salón, ingresá el PIN del dueño.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shrink-0 cursor-pointer hover:bg-amber-400 transition-colors"
                >
                  Desbloquear
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Modo Dueño Habilitado. Podés modificar los textos y guardar.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUnlocked(false)}
                  className="text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Volver a Bloquear
                </button>
              </div>
            )}

            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Formulario de Configuración */}
            <form onSubmit={handleSaveCouponSettings} className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              {/* Switch de Activación */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="font-bold text-white text-sm">Estado de la Promoción</h4>
                  <p className="text-xs text-slate-400">
                    Si desactivás este switch, el cupón dejará de ofrecerse temporalmente a los jugadores.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isUnlocked}
                    checked={couponForm.active}
                    onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Título y Descuento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs uppercase font-bold text-slate-400">Título de la Promoción</label>
                  <input
                    type="text"
                    disabled={!isUnlocked}
                    value={couponForm.title}
                    onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase font-bold text-slate-400">Texto Destacado (Descuento)</label>
                  <input
                    type="text"
                    disabled={!isUnlocked}
                    value={couponForm.discount}
                    onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Validez y Alcance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs uppercase font-bold text-slate-400">Validez del Cupón (Horas)</label>
                  <select
                    disabled={!isUnlocked}
                    value={couponForm.validityHours}
                    onChange={(e) => setCouponForm({ ...couponForm, validityHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    <option value={24}>24 Horas (1 día)</option>
                    <option value={48}>48 Horas (2 días)</option>
                    <option value={72}>72 Horas (3 días)</option>
                    <option value={168}>168 Horas (1 semana)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase font-bold text-slate-400">Alcance Comercial</label>
                  <input
                    type="text"
                    disabled={!isUnlocked}
                    value={couponForm.scopeLabel}
                    onChange={(e) => setCouponForm({ ...couponForm, scopeLabel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Medios de Pago */}
              <div className="space-y-1">
                <label className="block text-xs uppercase font-bold text-slate-400">Medios de Pago Admitidos (separados por coma)</label>
                <input
                  type="text"
                  disabled={!isUnlocked}
                  value={couponForm.paymentMethods}
                  onChange={(e) => setCouponForm({ ...couponForm, paymentMethods: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50"
                />
              </div>

              {/* Términos y Condiciones */}
              <div className="space-y-1">
                <label className="block text-xs uppercase font-bold text-slate-400">Términos y Condiciones (uno por línea)</label>
                <textarea
                  rows={4}
                  disabled={!isUnlocked}
                  value={couponForm.termsText}
                  onChange={(e) => setCouponForm({ ...couponForm, termsText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono disabled:opacity-50"
                />
              </div>

              {/* Botón de Guardar */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!isUnlocked || savingCoupon}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-bold text-sm shadow cursor-pointer disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{savingCoupon ? 'Guardando en la nube...' : 'Guardar Cambios Oficiales'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Modal de PIN para Desbloqueo */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onUnlock={() => setIsUnlocked(true)}
        expectedPin={sponsor?.ownerPin || '1984'}
        sponsorName={sponsor?.shortName || sponsor?.name}
      />
    </div>
  );
}
