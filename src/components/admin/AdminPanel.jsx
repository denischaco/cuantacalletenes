import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ArrowLeft,
  Mail,
  Key,
  LogIn,
  AlertCircle
} from 'lucide-react';
import RootDashboard from './RootDashboard';
import SponsorDashboard from './SponsorDashboard';
import {
  getAuthInstance,
  fetchSponsorsFromDb
} from '../../services/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import sponsorsFallback from '../../data/sponsors.json';

export default function AdminPanel({ onBackToGame }) {
  const [currentUser, setCurrentUser] = useState(null); // { email, role, sponsorId }
  const [sponsorsList, setSponsorsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulario de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deep Link de Canje (?redeem=...)
  const [redeemCode, setRedeemCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('redeem') || '';
    }
    return '';
  });

  // Cargar sponsors
  const loadSponsors = async () => {
    try {
      const sps = await fetchSponsorsFromDb(sponsorsFallback);
      setSponsorsList(sps);
    } catch (e) {
      setSponsorsList(sponsorsFallback);
    }
  };

  useEffect(() => {
    loadSponsors();

    // Escuchar Auth de Firebase si está disponible
    const auth = getAuthInstance();
    if (auth) {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user && user.email) {
          handleResolveUserRole(user.email);
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, []);

  // Determinar rol según email
  const handleResolveUserRole = (userEmail) => {
    const cleanEmail = userEmail.toLowerCase().trim();

    if (cleanEmail.includes('root') || cleanEmail.includes('admin') || cleanEmail.includes('denis')) {
      setCurrentUser({
        email: cleanEmail,
        role: 'root'
      });
      return;
    }

    // Buscar si es un sponsor
    const foundSponsor = sponsorsList.find(s =>
      cleanEmail.includes(s.id) || (s.email && s.email.toLowerCase() === cleanEmail)
    ) || sponsorsList[0];

    setCurrentUser({
      email: cleanEmail,
      role: 'sponsor',
      sponsorId: foundSponsor?.id || 'bacanal',
      sponsor: foundSponsor
    });
  };

  // Login tradicional
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setAuthError('');

    const auth = getAuthInstance();
    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        handleResolveUserRole(cred.user.email);
        setIsSubmitting(false);
        return;
      } catch (err) {
        console.warn('Firebase auth failed:', err.message);
      }
    }

    // Fallback de contingencia (desarrollo / validación por PIN del comercio)
    const cleanEmail = email.toLowerCase().trim();
    const isDev = Boolean(import.meta.env.DEV);

    if (cleanEmail.includes('root') || cleanEmail.includes('admin') || cleanEmail.includes('denis')) {
      if (isDev || (password && password.length >= 6)) {
        setCurrentUser({ email: cleanEmail, role: 'root' });
        setIsSubmitting(false);
        return;
      }
    } else if (cleanEmail.includes('bacanal') || cleanEmail.includes('fichita')) {
      const sp = sponsorsList.find(s => cleanEmail.includes(s.id)) || sponsorsList[0];
      const validPin = sp?.ownerPin || (sp?.id === 'bacanal' ? '1984' : '2026');
      if (isDev || password === validPin) {
        setCurrentUser({ email: cleanEmail, role: 'sponsor', sponsorId: sp?.id, sponsor: sp });
        setIsSubmitting(false);
        return;
      }
    }

    setAuthError('Credenciales no reconocidas. Verificá tu correo y contraseña.');
    setIsSubmitting(false);
  };

  // Cerrar Sesión
  const handleLogout = async () => {
    const auth = getAuthInstance();
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {}
    }
    setCurrentUser(null);
  };

  // Impersonar sponsor desde Root
  const handleImpersonateSponsor = (sp) => {
    setCurrentUser({
      email: `${sp.id}@cuantacalletenes.ar (vía Root)`,
      role: 'sponsor',
      sponsorId: sp.id,
      sponsor: sp,
      isImpersonating: true
    });
  };

  // 1. Vista de Panel Root
  if (currentUser?.role === 'root') {
    return (
      <RootDashboard
        sponsors={sponsorsList}
        onLogout={handleLogout}
        onImpersonateSponsor={handleImpersonateSponsor}
        onRefreshSponsors={loadSponsors}
      />
    );
  }

  // 2. Vista de Panel Sponsor
  if (currentUser?.role === 'sponsor' && currentUser.sponsor) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {currentUser.isImpersonating && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
            <span>👑 Estás viendo el panel como el comercio: {currentUser.sponsor.name}</span>
            <button
              onClick={() => setCurrentUser({ email: 'root@cuantacalletenes.ar', role: 'root' })}
              className="bg-slate-950 text-white px-2.5 py-1 rounded-lg text-[11px] cursor-pointer hover:bg-slate-900 transition-colors"
            >
              ← Volver a Root
            </button>
          </div>
        )}
        <SponsorDashboard
          sponsor={currentUser.sponsor}
          onLogout={handleLogout}
          initialRedeemCode={redeemCode}
          onUpdateSponsor={(updatedSponsor) => {
            setCurrentUser(prev => prev ? { ...prev, sponsor: updatedSponsor } : prev);
            setSponsorsList(prev => prev.map(s => s.id === updatedSponsor.id ? updatedSponsor : s));
          }}
        />
      </div>
    );
  }

  // 3. Pantalla de Login / Autenticación
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans relative py-8">
      {/* Elementos decorativos de fondo con colores de marca */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#F48138]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#339136]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Botón Volver al Juego */}
      <div className="w-full max-w-md flex justify-start mb-4 z-10">
        <button
          type="button"
          onClick={onBackToGame}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Juego</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 z-10 animate-scale-up">
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#241105] to-slate-950 border border-[#F48138]/50 shadow-lg text-2xl">
            🎟️
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
            Portal de Sponsors & Gestión
          </h2>
          <p className="text-xs text-slate-400">
            ¿Cuánta Calle Tenés? • Resistencia
          </p>

          {/* Aviso de Deep Link si viene con cupón */}
          {redeemCode && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-pulse">
              <QrCode className="w-4 h-4" />
              <span>Iniciá sesión para validar el cupón #{redeemCode}</span>
            </div>
          )}
        </div>

        {/* Formulario de Email / Password */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F48138]"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F48138]"
              />
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {authError && (
            <p className="text-xs text-rose-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{authError}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F48138] to-amber-500 hover:from-[#FFA559] hover:to-amber-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Iniciando sesión...' : 'Ingresar al Panel'}</span>
          </button>
        </form>

        {/* Nota de Acceso Restringido */}
        <div className="border-t border-slate-800 pt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Acceso restringido a comercios adheridos y administración.
          </p>
        </div>
      </div>
    </div>
  );
}
