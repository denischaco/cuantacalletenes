import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  where,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const STORAGE_KEY = 'cuanta_calle_leaderboard';
const LEADERBOARD_COLLECTION = 'leaderboard';

// Firebase configuration from environment with reliable client-side fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAeEy-OKbhU4lMwpapqmT1VqPBrHuJfTVg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cuantacalletenes.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cuantacalletenes',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cuantacalletenes.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '495525843068',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:495525843068:web:f91f6ab573e30f7b88b9f9',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5QEL8C8RBG'
};

let app = null;
let db = null;
let auth = null;
let isFirebaseAvailable = false;

if (firebaseConfig.apiKey) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseAvailable = true;

    // Attempt anonymous authentication to satisfy Firestore security rules
    signInAnonymously(auth).catch((err) => {
      console.warn('Firebase anonymous auth notice:', err.message);
    });
  } catch (error) {
    console.warn('Firebase initialization error, operating in local-storage mode:', error);
    isFirebaseAvailable = false;
  }
}

/**
 * Access Firestore instance safely
 */
export function getFirestoreInstance() {
  return isFirebaseAvailable ? db : null;
}

/**
 * Access Auth instance safely
 */
export function getAuthInstance() {
  return isFirebaseAvailable ? auth : null;
}

/**
 * Get cached local leaderboard
 */
export function getLocalLeaderboard() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading local leaderboard:', e);
  }
  return [];
}

/**
 * Save to local cache
 */
export function saveLocalLeaderboard(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (e) {
    console.error('Error saving local leaderboard:', e);
  }
}

/**
 * Save score locally with desempate logic (score DESC, totalTimeMs ASC)
 */
export function saveLocalScore({ name, score, rankBadge, zone, zoneId, totalTimeMs, date }) {
  const normalizedZone = zone || '4 Avenidas';
  const normalizedZoneId = zoneId || (normalizedZone.toLowerCase().includes('gran') ? 'toda_ciudad' : 'centro');

  const newEntry = {
    name: (name || 'Jugador').slice(0, 24),
    score: Number(score) || 0,
    totalTimeMs: Number(totalTimeMs) || 0,
    rankBadge: rankBadge || '🚕',
    zone: normalizedZone,
    zoneId: normalizedZoneId,
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  const current = getLocalLeaderboard();
  const updated = [...current, newEntry]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const tA = a.totalTimeMs && a.totalTimeMs > 0 ? a.totalTimeMs : 99999999;
      const tB = b.totalTimeMs && b.totalTimeMs > 0 ? b.totalTimeMs : 99999999;
      return tA - tB;
    })
    .slice(0, 50);
  saveLocalLeaderboard(updated);
  return updated;
}

/**
 * Subscribe in real-time to the Firestore leaderboard.
 * Orders by score descending and totalTimeMs ascending (speed tiebreaker).
 * Automatically falls back to localStorage if Firestore is unavailable.
 */
export function subscribeLeaderboard(callback) {
  // Always trigger immediately with current local cache
  const localScores = getLocalLeaderboard();
  callback(localScores);

  const firestoreDb = getFirestoreInstance();
  if (!firestoreDb) {
    return () => {};
  }

  try {
    const colRef = collection(firestoreDb, LEADERBOARD_COLLECTION);
    const q = query(colRef, orderBy('score', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteScores = snapshot.docs.map((d) => {
            const data = d.data();
            const z = data.zone || '4 Avenidas';
            const zid = data.zoneId || (z.toLowerCase().includes('gran') ? 'toda_ciudad' : 'centro');
            return {
              id: d.id,
              name: data.name || 'Anónimo',
              score: Number(data.score) || 0,
              totalTimeMs: Number(data.totalTimeMs) || 0,
              rankBadge: data.rankBadge || '🚕',
              zone: z,
              zoneId: zid,
              date: data.date || new Date().toISOString().split('T')[0]
            };
          });

          // Memory sort to guarantee exact desempate order (score DESC, time ASC)
          remoteScores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const tA = a.totalTimeMs && a.totalTimeMs > 0 ? a.totalTimeMs : 99999999;
            const tB = b.totalTimeMs && b.totalTimeMs > 0 ? b.totalTimeMs : 99999999;
            return tA - tB;
          });

          saveLocalLeaderboard(remoteScores);
          callback(remoteScores);
        } else if (snapshot.metadata.fromCache === false) {
          saveLocalLeaderboard([]);
          callback([]);
        }
      },
      (error) => {
        console.warn('Firestore live listener notice (using local storage):', error.message);
        callback(getLocalLeaderboard());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error subscribing to Firestore:', err);
    return () => {};
  }
}

/**
 * Save score entry with totalTimeMs and zoneId support
 */
export const saveScoreEntry = async ({ name, score, rankBadge, zone, zoneId, totalTimeMs, date }) => {
  const normalizedZone = zone || '4 Avenidas';
  const normalizedZoneId = zoneId || (normalizedZone.toLowerCase().includes('gran') ? 'toda_ciudad' : 'centro');

  const localResult = saveLocalScore({ name, score, rankBadge, zone: normalizedZone, zoneId: normalizedZoneId, totalTimeMs, date });
  try {
    const firestoreDb = getFirestoreInstance();
    if (!firestoreDb) {
      return localResult;
    }

    const colRef = collection(firestoreDb, LEADERBOARD_COLLECTION);
    const docRef = await addDoc(colRef, {
      name: (name || 'Jugador').slice(0, 24),
      score: Number(score),
      totalTimeMs: Number(totalTimeMs) || 0,
      rankBadge: rankBadge || '🚕',
      zone: normalizedZone,
      zoneId: normalizedZoneId,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });
    console.log('✅ Récord guardado exitosamente en Firestore (ID:', docRef.id, ')');
  } catch (err) {
    console.error('Error saving score:', err);
  }
  return localResult;
};

/**
 * Codifica los datos esenciales del reto en una cadena compacta URL-safe UTF-8
 */
export function encodeChallengePayload(data) {
  try {
    const compact = {
      n: data.creatorName || 'Jugador',
      s: Number(data.creatorScore) || 0,
      t: Number(data.creatorTimeMs) || 0,
      z: data.zoneId || 'centro',
      st: Array.isArray(data.streetIds) ? data.streetIds : []
    };
    const jsonStr = JSON.stringify(compact);
    return btoa(unescape(encodeURIComponent(jsonStr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.warn('Error encoding challenge payload:', e);
    return null;
  }
}

/**
 * Decodifica la cadena compacta URL-safe
 */
export function decodeChallengePayload(str) {
  try {
    if (!str) return null;
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const jsonStr = decodeURIComponent(escape(atob(b64)));
    const c = JSON.parse(jsonStr);
    return {
      creatorName: c.n || 'Retador',
      creatorScore: Number(c.s) || 0,
      creatorTimeMs: Number(c.t) || 0,
      zoneId: c.z || 'centro',
      streetIds: Array.isArray(c.st) ? c.st : []
    };
  } catch (e) {
    console.warn('Error decoding challenge payload:', e);
    return null;
  }
}

/**
 * Crear reto 1v1 Asincrónico por Enlace (Colección `challenges` + Respaldo Híbrido)
 */
export const createChallenge = async ({ creatorName, creatorScore, creatorTimeMs, zoneId, streetIds, creatorPhone }) => {
  const challengeData = {
    creatorName: (creatorName || 'Jugador').slice(0, 24),
    creatorScore: Number(creatorScore) || 0,
    creatorTimeMs: Number(creatorTimeMs) || 0,
    zoneId: zoneId || 'centro',
    streetIds: Array.isArray(streetIds) ? streetIds : [],
    creatorPhone: creatorPhone || null
  };

  const encodedData = encodeChallengePayload(challengeData);
  let challengeId = null;

  const firestoreDb = getFirestoreInstance();
  if (firestoreDb) {
    try {
      const docRef = await addDoc(collection(firestoreDb, 'challenges'), {
        ...challengeData,
        createdAt: serverTimestamp()
      });
      challengeId = docRef.id;
    } catch (e) {
      console.warn('Error saving challenge to Firestore, using fallback:', e);
    }
  }

  // Fallback ID si Firestore no estuviera disponible
  if (!challengeId) {
    challengeId = encodedData ? `d_${encodedData}` : `ch_${Date.now()}`;
  }

  // Guardar en cache local del dispositivo
  try {
    const stored = JSON.parse(localStorage.getItem('cuanta_calle_challenges') || '{}');
    stored[challengeId] = { id: challengeId, ...challengeData, createdAt: new Date().toISOString() };
    localStorage.setItem('cuanta_calle_challenges', JSON.stringify(stored));
  } catch (e) {
    console.warn('Error saving local challenge fallback:', e);
  }

  return {
    challengeId,
    encodedData
  };
};

/**
 * Obtener datos del reto 1v1 Asincrónico (soporta Firestore, payload directo ?d=... o fallback local)
 */
export const getChallenge = async (challengeId, encodedDataParam = null) => {
  // 1. Decodificación instantánea de alta velocidad desde ?d=...
  if (encodedDataParam) {
    const decoded = decodeChallengePayload(encodedDataParam);
    if (decoded && Array.isArray(decoded.streetIds) && decoded.streetIds.length > 0) {
      return { id: challengeId || 'encoded', ...decoded };
    }
  }

  if (!challengeId) return null;

  // 2. Si el challengeId contiene los datos autocontenidos (inicia con d_)
  if (challengeId.startsWith('d_')) {
    const decoded = decodeChallengePayload(challengeId.slice(2));
    if (decoded && Array.isArray(decoded.streetIds) && decoded.streetIds.length > 0) {
      return { id: challengeId, ...decoded };
    }
  }

  // 3. Consultar Firestore
  const firestoreDb = getFirestoreInstance();
  if (firestoreDb) {
    try {
      const docSnap = await getDoc(doc(firestoreDb, 'challenges', challengeId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (err) {
      console.warn('Error fetching challenge from Firestore, checking local fallback:', err);
    }
  }

  // 4. Fallback de almacenamiento local
  try {
    const stored = JSON.parse(localStorage.getItem('cuanta_calle_challenges') || '{}');
    if (stored[challengeId]) {
      return stored[challengeId];
    }
  } catch (e) {
    console.warn('Error reading local challenge fallback:', e);
  }

  return null;
};

/**
 * Send a test score to create/verify the collection in Firestore
 */
export async function sendTestScoreToFirestore() {
  const testEntry = {
    name: 'Prueba Moderación',
    score: 10,
    totalTimeMs: 15400,
    rankBadge: '🧪',
    zone: '4 Avenidas',
    zoneId: 'centro',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  const firestoreDb = getFirestoreInstance();
  if (!firestoreDb) {
    return {
      success: false,
      error: 'Firebase no está inicializado. Revisá la configuración en .env'
    };
  }

  try {
    const colRef = collection(firestoreDb, LEADERBOARD_COLLECTION);
    const docRef = await addDoc(colRef, {
      ...testEntry,
      timestamp: serverTimestamp()
    });
    console.log('✅ Documento de prueba creado exitosamente en Firestore con ID:', docRef.id);
    return {
      success: true,
      docId: docRef.id
    };
  } catch (err) {
    console.error('❌ Error al escribir prueba en Firestore:', err);
    return {
      success: false,
      error: err.message || err.code || String(err)
    };
  }
}


/**
 * Save B2B sponsorship inquiry / lead to Firestore
 */
export async function saveSponsorshipLead(leadData) {
  const leadEntry = {
    businessName: leadData.businessName || '',
    category: leadData.category || 'Gastronomía',
    address: leadData.address || '',
    contactName: leadData.contactName || '',
    whatsapp: leadData.whatsapp || '',
    plan: leadData.plan || 'Esquina Destacada + Cupón ($55.000/mes)',
    notes: leadData.notes || '',
    createdAt: new Date().toISOString()
  };

  // Fallback cache in localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('sponsorship_leads') || '[]');
    localStorage.setItem('sponsorship_leads', JSON.stringify([...existing, leadEntry]));
  } catch (e) {
    console.warn('Error caching lead locally:', e);
  }

  const firestoreDb = getFirestoreInstance();
  if (firestoreDb) {
    try {
      const colRef = collection(firestoreDb, 'sponsorship_leads');
      const docRef = await addDoc(colRef, {
        ...leadEntry,
        timestamp: serverTimestamp()
      });
      console.log('✅ Lead comercial guardado en Firestore (ID:', docRef.id, ')');
      return { success: true, docId: docRef.id };
    } catch (err) {
      console.warn('Lead guardado localmente (aviso Firestore):', err.message);
      return { success: true, localOnly: true };
    }
  }

  return { success: true, localOnly: true };
}

// ============================================================================
// SPONSOR & COUPON BACKEND ENGINE
// ============================================================================

const LOCAL_COUPONS_KEY = 'cct_coupons_registry';
const LOCAL_NOTIFS_KEY = 'cct_admin_notifications';
const LOCAL_SPONSORS_KEY = 'cct_sponsors_db';

/**
 * Guarda un cupón generado por un jugador en Firestore
 */
export async function saveGeneratedCoupon(couponData) {
  if (!couponData || !couponData.uniqueId) return { success: false };

  const couponDoc = {
    id: couponData.uniqueId,
    sponsorId: couponData.sponsorId || 'general',
    sponsorName: couponData.sponsorName || 'Sponsor Oficial',
    title: couponData.title || 'Cupón Oficial',
    discount: couponData.discount || '15% OFF',
    code: couponData.code || 'CALLE-DESCUENTO',
    scope: couponData.scope || 'individual',
    scopeLabel: couponData.scopeLabel || 'Por persona',
    paymentMethods: couponData.paymentMethods || ['Efectivo', 'Transferencia'],
    terms: couponData.terms || [],
    status: 'pending', // 'pending' | 'redeemed' | 'expired'
    issuedAt: couponData.issuedAt || new Date().toISOString(),
    expiresAt: couponData.expiresAt || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    redeemedAt: null,
    redeemedBy: null
  };

  // 1. Guardar en caché local
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_COUPONS_KEY) || '{}');
    local[couponDoc.id] = couponDoc;
    localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(local));
  } catch (e) {
    console.warn('Error saving local coupon fallback:', e);
  }

  // 2. Guardar en Firestore
  const firestoreDb = getFirestoreInstance();
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'coupons', couponDoc.id);
      await setDoc(docRef, {
        ...couponDoc,
        createdAt: serverTimestamp()
      }, { merge: true });
      return { success: true, id: couponDoc.id };
    } catch (err) {
      console.warn('Error saving coupon to Firestore (operando con fallback local):', err);
    }
  }

  return { success: true, localOnly: true, id: couponDoc.id };
}

/**
 * Busca un cupón por su ID único (desde Firestore o fallback local)
 */
export async function getCouponById(couponId) {
  if (!couponId) return null;
  const cleanId = String(couponId).trim();

  // 1. Consultar Firestore
  const firestoreDb = getFirestoreInstance();
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'coupons', cleanId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (err) {
      console.warn('Error reading coupon from Firestore:', err);
    }
  }

  // 2. Fallback local
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_COUPONS_KEY) || '{}');
    if (local[cleanId]) {
      return local[cleanId];
    }
  } catch (e) {
    console.warn('Error reading local coupon:', e);
  }

  return null;
}

/**
 * Realiza el canje de un cupón en el local (Mozo / Cajero)
 */
export async function redeemCoupon(couponId, redeemedBy = 'Caja 1') {
  if (!couponId) return { success: false, error: 'ID de cupón no provisto' };
  const cleanId = String(couponId).trim();

  // 1. Obtener cupón
  const coupon = await getCouponById(cleanId);
  if (!coupon) {
    return { success: false, notFound: true, error: 'Cupón no encontrado en el sistema.' };
  }

  // 2. Verificar si ya fue canjeado
  if (coupon.status === 'redeemed') {
    return {
      success: false,
      alreadyRedeemed: true,
      coupon,
      error: `Este cupón ya fue canjeado el ${new Date(coupon.redeemedAt).toLocaleString('es-AR')} por ${coupon.redeemedBy || 'Caja'}.`
    };
  }

  // 3. Verificar expiración
  const now = new Date();
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return {
      success: false,
      expired: true,
      coupon,
      error: 'Este cupón ha superado su plazo de validez y está expirado.'
    };
  }

  // 4. Marcar como canjeado
  const updatedData = {
    ...coupon,
    status: 'redeemed',
    redeemedAt: now.toISOString(),
    redeemedBy: redeemedBy || 'Caja 1'
  };

  // Actualizar local
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_COUPONS_KEY) || '{}');
    local[cleanId] = updatedData;
    localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(local));
  } catch (e) {
    console.warn('Error updating local coupon:', e);
  }

  // Actualizar Firestore
  const firestoreDb = getFirestoreInstance();
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'coupons', cleanId);
      await updateDoc(docRef, {
        status: 'redeemed',
        redeemedAt: updatedData.redeemedAt,
        redeemedBy: updatedData.redeemedBy
      });

      // Incrementar métrica mensual en sponsor_stats
      if (coupon.sponsorId) {
        const currentMonth = now.toISOString().slice(0, 7);
        const statsRef = doc(firestoreDb, 'sponsor_stats', `${coupon.sponsorId}_${currentMonth}`);
        await setDoc(statsRef, {
          sponsorId: coupon.sponsorId,
          month: currentMonth,
          coupons_redeemed_count: increment(1),
          lastRedemption: updatedData.redeemedAt
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Error saving redemption to Firestore (guardado localmente):', err);
    }
  }

  return { success: true, coupon: updatedData };
}

/**
 * Escucha en tiempo real los cupones de un sponsor para métricas
 */
export function subscribeSponsorCoupons(sponsorId, callback) {
  const computeStats = (couponsList) => {
    const totalGenerated = couponsList.length;
    const redeemedList = couponsList.filter(c => c.status === 'redeemed');
    const totalRedeemed = redeemedList.length;
    const pendingList = couponsList.filter(c => c.status === 'pending');
    const conversionRate = totalGenerated > 0 ? ((totalRedeemed / totalGenerated) * 100).toFixed(1) : '0';

    return {
      totalGenerated,
      totalRedeemed,
      pendingCount: pendingList.length,
      conversionRate,
      coupons: couponsList
    };
  };

  // 1. Respuesta inmediata con caché local
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_COUPONS_KEY) || '{}');
    const filtered = Object.values(local).filter(c => !sponsorId || sponsorId === 'all' || c.sponsorId === sponsorId);
    callback(computeStats(filtered));
  } catch (e) {
    console.warn('Local coupons stats error:', e);
  }

  const firestoreDb = getFirestoreInstance();
  if (!firestoreDb) return () => {};

  try {
    const colRef = collection(firestoreDb, 'coupons');
    let q;
    if (!sponsorId || sponsorId === 'all') {
      q = query(colRef, limit(200));
    } else {
      q = query(colRef, where('sponsorId', '==', sponsorId), limit(200));
    }

    return onSnapshot(q, (snap) => {
      const remote = snap.docs.map(d => d.data());
      callback(computeStats(remote));
    }, (err) => {
      console.warn('Firestore coupons subscription error:', err);
    });
  } catch (e) {
    console.warn('Error setting coupons snapshot listener:', e);
    return () => {};
  }
}

/**
 * Obtiene los sponsors (de Firestore o fallback local)
 */
export async function fetchSponsorsFromDb(fallbackSponsors = []) {
  const firestoreDb = getFirestoreInstance();
  if (firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'sponsors'));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        try {
          localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(remote));
        } catch (e) {}
        return remote;
      } else if (fallbackSponsors.length > 0) {
        // Inicializar la colección en Firestore con los sponsors base
        for (const sp of fallbackSponsors) {
          const docRef = doc(firestoreDb, 'sponsors', sp.id);
          await setDoc(docRef, {
            ...sp,
            ownerPin: sp.id === 'bacanal' ? '1984' : '2026',
            expiresAt: sp.expiresAt || new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString()
          }, { merge: true });
        }
        try {
          localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(fallbackSponsors));
        } catch (e) {}
        return fallbackSponsors;
      }
    } catch (err) {
      console.warn('Error reading sponsors from Firestore:', err);
    }
  }

  // Fallback local
  try {
    const cached = localStorage.getItem(LOCAL_SPONSORS_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  return fallbackSponsors;
}

/**
 * Guarda o actualiza un sponsor completo (usado por Root Superadmin)
 */
export async function saveOrUpdateSponsor(sponsorData) {
  const firestoreDb = getFirestoreInstance();

  // Generar o normalizar ID seguro
  const rawId = (sponsorData.id || sponsorData.shortName || sponsorData.name || 'comercio')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/^-+|-+$/g, '');
  const sponsorId = rawId || `sponsor-${Date.now()}`;

  const cleanSponsor = {
    ...sponsorData,
    id: sponsorId,
    name: sponsorData.name || 'Nuevo Sponsor',
    shortName: sponsorData.shortName || sponsorData.name || 'Sponsor',
    rubro: sponsorData.rubro || 'Comercio Local',
    address: sponsorData.address || 'Resistencia, Chaco',
    coordinates: Array.isArray(sponsorData.coordinates) && sponsorData.coordinates.length === 2
      ? [Number(sponsorData.coordinates[0]), Number(sponsorData.coordinates[1])]
      : [-27.45105, -58.98648],
    active: sponsorData.active !== undefined ? Boolean(sponsorData.active) : true,
    ownerPin: sponsorData.ownerPin ? String(sponsorData.ownerPin).slice(0, 4) : '1984',
    plan: sponsorData.plan || 'sponsor_zona',
    zoneId: sponsorData.zoneId || 'centro',
    badge: sponsorData.badge || '',
    logoBg: sponsorData.logoBg || '#FFFFFF',
    expiresAt: sponsorData.expiresAt || new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
    targetStreet: sponsorData.targetStreet || {
      id: `${sponsorId}-target`,
      name: sponsorData.address || sponsorData.name,
      shortStreet: sponsorData.address || sponsorData.name,
      number: '',
      aliases: [sponsorId, (sponsorData.shortName || '').toLowerCase()]
    },
    coupon: sponsorData.coupon || {
      active: true,
      title: '15% OFF en tu Consumo',
      discount: '15% OFF',
      code: `CALLE-${sponsorId.toUpperCase()}`,
      validityHours: 48,
      scope: 'individual',
      scopeLabel: 'Por persona / Comensal individual',
      paymentMethods: ['Efectivo', 'Transferencia bancaria'],
      terms: ['Presentar la captura en caja antes de pedir la cuenta.', 'No acumulable con otras promociones.'],
      instructions: 'Mostrá tu cupón con ID único en caja al pedir la cuenta.'
    },
    updatedAt: new Date().toISOString()
  };

  // 1. Guardar en Firestore
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'sponsors', sponsorId);
      await setDoc(docRef, {
        ...cleanSponsor,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Error saving sponsor in Firestore:', err);
    }
  }

  // 2. Actualizar caché local inmediata
  try {
    const raw = localStorage.getItem(LOCAL_SPONSORS_KEY);
    let list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(s => s.id === sponsorId);
    if (idx >= 0) {
      list[idx] = cleanSponsor;
    } else {
      list.push(cleanSponsor);
    }
    localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(list));
  } catch (e) {}

  // 3. Registrar auditoría interna
  await addAdminNotification({
    type: 'sponsor_saved',
    sponsorId,
    sponsorName: cleanSponsor.name,
    message: `Sponsor "${cleanSponsor.name}" (${sponsorId}) guardado y sincronizado por Denis (Root).`
  });

  return { success: true, sponsor: cleanSponsor };
}

/**
 * Elimina un sponsor permanentemente (usado por Root Superadmin)
 */
export async function deleteSponsor(sponsorId, sponsorName = '') {
  const firestoreDb = getFirestoreInstance();

  if (firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'sponsors', sponsorId));
    } catch (err) {
      console.warn('Error deleting sponsor in Firestore:', err);
    }
  }

  // Actualizar caché local
  try {
    const raw = localStorage.getItem(LOCAL_SPONSORS_KEY);
    if (raw) {
      const list = JSON.parse(raw).filter(s => s.id !== sponsorId);
      localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(list));
    }
  } catch (e) {}

  await addAdminNotification({
    type: 'sponsor_deleted',
    sponsorId,
    sponsorName: sponsorName || sponsorId,
    message: `El sponsor "${sponsorName || sponsorId}" fue eliminado por Denis (Root).`
  });

  return { success: true };
}

/**
 * Actualiza el cupón de un sponsor y emite notificación para Root
 */
export async function updateSponsorCoupon(sponsorId, couponUpdate, sponsorName = '') {
  const firestoreDb = getFirestoreInstance();
  const notifMessage = `${sponsorName || sponsorId} modificó su cupón: "${couponUpdate.title || ''}" (${couponUpdate.discount || ''})`;

  // 1. Guardar notificación
  await addAdminNotification({
    type: 'coupon_updated',
    sponsorId,
    sponsorName: sponsorName || sponsorId,
    message: notifMessage
  });

  // 2. Actualizar en Firestore
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'sponsors', sponsorId);
      await updateDoc(docRef, {
        coupon: couponUpdate,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      console.warn('Error updating sponsor coupon in Firestore:', err);
    }
  }

  return { success: true, localOnly: true };
}

/**
 * Extiende la suscripción de un sponsor sumando meses
 */
export async function extendSponsorSubscription(sponsorId, monthsToAdd = 3, sponsorName = '') {
  const firestoreDb = getFirestoreInstance();
  let currentExpiresAt = null;

  if (firestoreDb) {
    try {
      const snap = await getDoc(doc(firestoreDb, 'sponsors', sponsorId));
      if (snap.exists()) {
        currentExpiresAt = snap.data().expiresAt;
      }
    } catch (e) {}
  }

  const baseDate = currentExpiresAt && new Date(currentExpiresAt) > new Date()
    ? new Date(currentExpiresAt)
    : new Date();

  const newExpiresAt = new Date(baseDate.getTime() + monthsToAdd * 30 * 24 * 3600 * 1000).toISOString();

  // Guardar en Firestore
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'sponsors', sponsorId);
      await updateDoc(docRef, {
        expiresAt: newExpiresAt,
        active: true,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Error extending sponsor in Firestore:', err);
    }
  }

  // Notificación de auditoría
  await addAdminNotification({
    type: 'subscription_extended',
    sponsorId,
    sponsorName: sponsorName || sponsorId,
    message: `Sponsoreo extendido por ${monthsToAdd} meses. Nuevo vencimiento: ${new Date(newExpiresAt).toLocaleDateString('es-AR')}`
  });

  return { success: true, newExpiresAt };
}

/**
 * Añade una notificación interna para el usuario Root
 */
export async function addAdminNotification({ type, sponsorId, sponsorName, message }) {
  const notif = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type: type || 'general',
    sponsorId: sponsorId || '',
    sponsorName: sponsorName || '',
    message: message || '',
    read: false,
    createdAt: new Date().toISOString()
  };

  // Local cache
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_NOTIFS_KEY) || '[]');
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify([notif, ...local.slice(0, 49)]));
  } catch (e) {}

  const firestoreDb = getFirestoreInstance();
  if (firestoreDb) {
    try {
      const colRef = collection(firestoreDb, 'admin_notifications');
      await addDoc(colRef, {
        ...notif,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.warn('Error writing admin notification:', e);
    }
  }

  return notif;
}

/**
 * Escucha notificaciones para el panel Root
 */
export function subscribeAdminNotifications(callback) {
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_NOTIFS_KEY) || '[]');
    callback(local);
  } catch (e) {}

  const firestoreDb = getFirestoreInstance();
  if (!firestoreDb) return () => {};

  try {
    const colRef = collection(firestoreDb, 'admin_notifications');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(30));
    return onSnapshot(q, (snap) => {
      const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(remote);
    }, (err) => {
      console.warn('Error in notifications subscription:', err);
    });
  } catch (e) {
    return () => {};
  }
}

