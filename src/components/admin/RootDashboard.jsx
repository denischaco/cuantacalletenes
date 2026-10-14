import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  Bell,
  Calendar,
  Store,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Sparkles,
  KeyRound,
  Eye,
  Check,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';
import {
  extendSponsorSubscription,
  subscribeAdminNotifications,
  subscribeSponsorCoupons,
  getCouponById,
  redeemCoupon,
  saveOrUpdateSponsor,
  deleteSponsor
} from '../../services/firebase';
import SponsorModal from './SponsorModal';

export default function RootDashboard({ sponsors, onLogout, onImpersonateSponsor, onRefreshSponsors }) {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [extendingId, setExtendingId] = useState(null);
  const [extensionNotice, setExtensionNotice] = useState('');

  // Modal para Crear / Editar Sponsor
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);

  const handleOpenCreateSponsor = () => {
    setEditingSponsor(null);
    setIsSponsorModalOpen(true);
  };

  const handleOpenEditSponsor = (sp) => {
    setEditingSponsor(sp);
    setIsSponsorModalOpen(true);
  };

  const handleSaveSponsor = async (sponsorPayload) => {
    const res = await saveOrUpdateSponsor(sponsorPayload);
    if (res.success) {
      setExtensionNotice(`¡Sponsor "${res.sponsor.name}" guardado exitosamente en Firestore!`);
      if (onRefreshSponsors) onRefreshSponsors();
      setTimeout(() => setExtensionNotice(''), 4500);
    }
  };

  const handleDeleteSponsor = async (sp) => {
    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${sp.name}"? Esta acción removerá el comercio del mapa.`);
    if (!confirm) return;

    try {
      const res = await deleteSponsor(sp.id, sp.name);
      if (res.success) {
        setExtensionNotice(`El sponsor "${sp.name}" fue eliminado.`);
        if (onRefreshSponsors) onRefreshSponsors();
        setTimeout(() => setExtensionNotice(''), 4500);
      }
    } catch (err) {
      alert('Error eliminando sponsor: ' + err.message);
    }
  };

  // Métricas globales
  const [globalStats, setGlobalStats] = useState({
    totalGenerated: 0,
    totalRedeemed: 0,
    pendingCount: 0,
    conversionRate: '0'
  });

  // Validador universal de cupones
  const [universalCode, setUniversalCode] = useState('');
  const [searchedCoupon, setSearchedCoupon] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  // Escuchar notificaciones administrativas
  useEffect(() => {
    const unsub = subscribeAdminNotifications((notifs) => {
      setNotifications(notifs);
    });
    return () => unsub();
  }, []);

  // Escuchar estadísticas globales de todos los cupones
  useEffect(() => {
    const unsub = subscribeSponsorCoupons('all', (data) => {
      setGlobalStats(data);
    });
    return () => unsub();
  }, []);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Extender 3 meses a un sponsor
  const handleExtendSubscription = async (sponsor) => {
    const confirm = window.confirm(`¿Extender 3 meses (+90 días) la habilitación de "${sponsor.name}"?`);
    if (!confirm) return;

    setExtendingId(sponsor.id);
    setExtensionNotice('');

    try {
      const res = await extendSponsorSubscription(sponsor.id, 3, sponsor.name);
      if (res.success) {
        setExtensionNotice(`¡Suscripción de ${sponsor.shortName || sponsor.name} extendida por 3 meses!`);
        if (onRefreshSponsors) onRefreshSponsors();
        setTimeout(() => setExtensionNotice(''), 4000);
      }
    } catch (err) {
      alert('Error extendiendo sponsoreo: ' + err.message);
    } finally {
      setExtendingId(null);
    }
  };

  // Buscar cupón universal
  const handleSearchUniversal = async (e) => {
    if (e) e.preventDefault();
    const code = universalCode.trim();
    if (!code) return;

    setSearching(true);
    setSearchError('');
    setSearchedCoupon(null);

    try {
      const res = await getCouponById(code);
      if (res) {
        setSearchedCoupon(res);
      } else {
        setSearchError('No se encontró ningún cupón con ese ID en la base de datos.');
      }
    } catch (err) {
      setSearchError('Error al buscar cupón: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  // Canjear cupón desde Root
  const handleRedeemUniversal = async () => {
    if (!searchedCoupon?.id) return;
    setRedeeming(true);
    try {
      const res = await redeemCoupon(searchedCoupon.id, 'Root Superadmin');
      if (res.success) {
        setSearchedCoupon(res.coupon);
      } else {
        setSearchError(res.error || 'Error al canjear');
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-32">
      {/* Header Maestro */}
      <header className="bg-slate-900 border-b border-amber-500/30 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 px-4 py-3 shadow-lg shadow-black/40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo y Rol */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-[#F48138] p-2 flex items-center justify-center text-slate-950 shadow-md shadow-amber-950/40 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-white text-base sm:text-lg tracking-wide truncate">
                  Panel Root • Denis Chaco
                </h1>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
                  Superadmin
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Gestión comercial & control de sponsors de Cuánta Calle
              </p>
            </div>
          </div>

          {/* Campanita de Notificaciones y Logout */}
          <div className="flex items-center gap-2">
            {/* Campanita */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors relative cursor-pointer"
                title="Notificaciones del Sistema"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Dropdown de Notificaciones */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-scale-up space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Auditoría de Actividad</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">{notifications.length} eventos</span>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No hay notificaciones recientes.</p>
                  ) : (
                    <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto space-y-2 pr-1">
                      {notifications.map((n) => (
                        <div key={n.id} className="pt-2 text-xs space-y-0.5">
                          <p className="font-medium text-slate-200">{n.message}</p>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(n.createdAt).toLocaleString('es-AR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto w-full px-4 pt-5 space-y-6">
        {/* Banner de Éxito de Extensión */}
        {extensionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-fade-in shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-sm">{extensionNotice}</span>
          </div>
        )}

        {/* Métricas Globales de la Plataforma */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow">
            <span className="text-[10px] uppercase font-bold text-slate-400">Sponsors Activos</span>
            <div className="text-2xl sm:text-3xl font-heading font-black text-amber-400">{sponsors.length}</div>
            <p className="text-[10px] text-slate-400">Comercios en Resistencia</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow">
            <span className="text-[10px] uppercase font-bold text-slate-400">Cupones Generados</span>
            <div className="text-2xl sm:text-3xl font-heading font-black text-white">{globalStats.totalGenerated}</div>
            <p className="text-[10px] text-slate-400">En partidas de jugadores</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Canjes en Locales</span>
            <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-400">{globalStats.totalRedeemed}</div>
            <p className="text-[10px] text-slate-400">Clientes llevados al salón</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow">
            <span className="text-[10px] uppercase font-bold text-[#FFA559]">Conversión Total</span>
            <div className="text-2xl sm:text-3xl font-heading font-black text-[#FFA559]">{globalStats.conversionRate}%</div>
            <p className="text-[10px] text-slate-400">Efectividad B2B global</p>
          </div>
        </div>

        {/* Sección: Administración de Sponsors y Habilitaciones */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-black text-white text-base sm:text-lg flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>Sponsors Comerciales & Habilitaciones</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Vigencia por períodos de 3 meses • Configuración GPS, esquinas y cupones
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateSponsor}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-950/40 cursor-pointer transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Sponsor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsors.map((sp) => {
              const expDate = sp.expiresAt ? new Date(sp.expiresAt) : new Date(Date.now() + 90 * 24 * 3600 * 1000);
              const now = new Date();
              const diffMs = expDate.getTime() - now.getTime();
              const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              const isExpired = daysLeft <= 0;
              const isExpiringSoon = daysLeft > 0 && daysLeft <= 15;

              return (
                <div
                  key={sp.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Encabezado Comercio */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: sp.logoBg || '#FFFFFF' }}
                          className="w-12 h-12 rounded-2xl p-1.5 border border-[#F48138]/40 shadow flex items-center justify-center shrink-0 overflow-hidden"
                        >
                          {sp.badge ? (
                            <img src={sp.badge} alt={sp.name} className="w-full h-full object-contain" />
                          ) : (
                            <Store className="w-6 h-6 text-slate-800" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-heading font-black text-white text-base leading-tight">
                            {sp.name}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {sp.rubro} • {sp.address}
                          </p>
                        </div>
                      </div>

                      {/* Badge de Estado y Botón Eliminar */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isExpired
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isExpiringSoon
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {isExpired ? 'Vencido' : isExpiringSoon ? 'Vence Pronto' : 'Activo'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteSponsor(sp)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Eliminar sponsor permanentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Habilitación / Cuenta Regresiva */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>Vencimiento de Suscripción:</span>
                        </span>
                        <span className={`font-mono font-bold ${isExpired ? 'text-rose-400' : 'text-slate-200'}`}>
                          {expDate.toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      <p className={`text-xs font-bold ${
                        isExpired ? 'text-rose-400' : isExpiringSoon ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {isExpired
                          ? 'Sponsoreo deshabilitado por cumplimiento de plazo.'
                          : `Quedan ${daysLeft} días de visibilidad activa en el juego.`}
                      </p>
                    </div>

                    {/* Datos de Acceso y Cupón */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">Cupón Actual</span>
                        <span className="font-bold text-white truncate block">
                          {sp.coupon?.discount || '15% OFF'} • {sp.coupon?.title || 'Promo'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">PIN Candado Dueño</span>
                        <span className="font-mono font-bold text-amber-400">
                          {sp.ownerPin || (sp.id === 'bacanal' ? '1984' : '2026')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Gestión */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2">
                    {/* Botón Editar Datos */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditSponsor(sp)}
                      className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-amber-500/30"
                      title="Editar datos del sponsor, coordenadas y beneficios"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    {/* Botón +3 Meses */}
                    <button
                      type="button"
                      disabled={extendingId === sp.id}
                      onClick={() => handleExtendSubscription(sp)}
                      className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow transition-all cursor-pointer disabled:opacity-50"
                      title="Extender habilitación 90 días"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{extendingId === sp.id ? '...' : '+ 3 Meses'}</span>
                    </button>

                    {/* Botón Administrar / Ver como Sponsor */}
                    <button
                      type="button"
                      onClick={() => onImpersonateSponsor(sp)}
                      className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Ver panel del comercio"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Panel Local</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección: Validador Universal de Cupones */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#F48138]" />
            <h3 className="font-heading font-black text-white text-base">
              Validador & Consulta Rápida de Cupones (Toda la Plataforma)
            </h3>
          </div>

          <form onSubmit={handleSearchUniversal} className="flex gap-2">
            <input
              type="text"
              value={universalCode}
              onChange={(e) => setUniversalCode(e.target.value)}
              placeholder="Ingresá cualquier ID de cupón (ej: 261014-1030-4821)"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#F48138]"
            />
            <button
              type="submit"
              disabled={searching || !universalCode.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#F48138] hover:bg-[#FFA559] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>{searching ? 'Buscando...' : 'Consultar'}</span>
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> {searchError}
            </p>
          )}

          {/* Ficha Encontrada */}
          {searchedCoupon && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-bold text-white">
                  {searchedCoupon.sponsorName} • ID: <span className="font-mono text-amber-400">{searchedCoupon.id}</span>
                </span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  searchedCoupon.status === 'redeemed'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {searchedCoupon.status === 'redeemed' ? 'Canjeado' : 'Pendiente / Válido'}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p><strong>Beneficio:</strong> {searchedCoupon.discount} - {searchedCoupon.title}</p>
                <p><strong>Emitido:</strong> {new Date(searchedCoupon.issuedAt).toLocaleString('es-AR')}</p>
                {searchedCoupon.status === 'redeemed' && (
                  <p className="text-rose-400">
                    <strong>Canjeado el:</strong> {new Date(searchedCoupon.redeemedAt).toLocaleString('es-AR')} por {searchedCoupon.redeemedBy}
                  </p>
                )}
              </div>

              {searchedCoupon.status !== 'redeemed' && (
                <button
                  type="button"
                  onClick={handleRedeemUniversal}
                  disabled={redeeming}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{redeeming ? 'Canjeando...' : 'Marcar como Canjeado desde Root'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal para Crear y Editar Sponsors */}
      <SponsorModal
        isOpen={isSponsorModalOpen}
        onClose={() => setIsSponsorModalOpen(false)}
        sponsorToEdit={editingSponsor}
        onSave={handleSaveSponsor}
      />
    </div>
  );
}
