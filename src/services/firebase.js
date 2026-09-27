import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const STORAGE_KEY = 'cuanta_calle_leaderboard';
const LEADERBOARD_COLLECTION = 'leaderboard';
export const ADMIN_CLEAR_PASSWORD = import.meta.env.VITE_ADMIN_CLEAR_PASSWORD || 'matadoresalataque';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cuantacalletenes.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cuantacalletenes',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cuantacalletenes.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '495525843068',
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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
export function saveLocalScore({ name, score, rankBadge, zone, totalTimeMs, date }) {
  const newEntry = {
    name: (name || 'Jugador').slice(0, 24),
    score: Number(score) || 0,
    totalTimeMs: Number(totalTimeMs) || 0,
    rankBadge: rankBadge || '🚕',
    zone: zone || 'Centro',
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  const current = getLocalLeaderboard();
  const updated = [...current, newEntry]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.totalTimeMs || 0) - (b.totalTimeMs || 0);
    })
    .slice(0, 30);
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
    const q = query(colRef, orderBy('score', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteScores = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name || 'Anónimo',
              score: Number(data.score) || 0,
              totalTimeMs: Number(data.totalTimeMs) || 0,
              rankBadge: data.rankBadge || '🚕',
              zone: data.zone || 'Centro',
              date: data.date || new Date().toISOString().split('T')[0]
            };
          });

          // Memory sort to guarantee exact desempate order
          remoteScores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (a.totalTimeMs || 0) - (b.totalTimeMs || 0);
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
 * Save score entry with totalTimeMs support (Documento Técnico Maestro v2.0)
 */
export const saveScoreEntry = async ({ name, score, rankBadge, zone, totalTimeMs, date }) => {
  const localResult = saveLocalScore({ name, score, rankBadge, zone, totalTimeMs, date });
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
      zone: zone || 'Centro',
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
 * Crear reto 1v1 Asincrónico por Enlace (Colección `challenges`)
 */
export const createChallenge = async ({ creatorName, creatorScore, creatorTimeMs, zoneId, streetIds, creatorPhone }) => {
  const firestoreDb = getFirestoreInstance();
  if (!firestoreDb) {
    // Fallback local para entornos sin Firebase activo
    const fallbackId = `ch_${Date.now()}`;
    const fallbackChallenge = {
      id: fallbackId,
      creatorName: (creatorName || 'Jugador').slice(0, 24),
      creatorScore: Number(creatorScore) || 0,
      creatorTimeMs: Number(creatorTimeMs) || 0,
      zoneId: zoneId || 'centro',
      streetIds: Array.isArray(streetIds) ? streetIds : [],
      creatorPhone: creatorPhone || null,
      createdAt: new Date().toISOString()
    };
    try {
      const stored = JSON.parse(localStorage.getItem('cuanta_calle_challenges') || '{}');
      stored[fallbackId] = fallbackChallenge;
      localStorage.setItem('cuanta_calle_challenges', JSON.stringify(stored));
    } catch (e) {
      console.warn('Error saving local challenge fallback:', e);
    }
    return fallbackId;
  }

  const docRef = await addDoc(collection(firestoreDb, 'challenges'), {
    creatorName: (creatorName || 'Jugador').slice(0, 24),
    creatorScore: Number(creatorScore) || 0,
    creatorTimeMs: Number(creatorTimeMs) || 0,
    zoneId: zoneId || 'centro',
    streetIds: Array.isArray(streetIds) ? streetIds : [],
    creatorPhone: creatorPhone || null,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

/**
 * Obtener datos del reto 1v1 Asincrónico
 */
export const getChallenge = async (challengeId) => {
  if (!challengeId) return null;
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

  // Fallback local
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
    zone: 'Centro',
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
 * Delete a single score entry (requires password: 'matadoresalataque')
 */
export async function deleteScoreEntry(id, index, password) {
  if (password !== ADMIN_CLEAR_PASSWORD) {
    return {
      success: false,
      error: 'Contraseña incorrecta'
    };
  }

  const firestoreDb = getFirestoreInstance();
  if (firestoreDb && id) {
    try {
      await deleteDoc(doc(firestoreDb, LEADERBOARD_COLLECTION, id));
    } catch (err) {
      console.warn('Error eliminando de Firestore:', err.message);
    }
  }

  // Update local cache
  const current = getLocalLeaderboard();
  const updated = current.filter((item, idx) => {
    if (id && item.id) return item.id !== id;
    return idx !== index;
  });
  saveLocalLeaderboard(updated);

  return {
    success: true
  };
}

/**
 * Clear the leaderboard (requires password: 'matadoresalataque')
 */
export async function clearLeaderboardWithPassword(password) {
  if (password !== ADMIN_CLEAR_PASSWORD) {
    return {
      success: false,
      error: 'Contraseña incorrecta'
    };
  }

  // Clear local storage
  saveLocalLeaderboard([]);

  // Clear Firestore documents if connected
  const firestoreDb = getFirestoreInstance();
  if (firestoreDb) {
    try {
      const colRef = collection(firestoreDb, LEADERBOARD_COLLECTION);
      const snapshot = await getDocs(colRef);
      const deletePromises = snapshot.docs.map((d) => deleteDoc(doc(firestoreDb, LEADERBOARD_COLLECTION, d.id)));
      await Promise.all(deletePromises);
    } catch (err) {
      console.warn('Notice clearing Firestore collection:', err.message);
    }
  }

  return {
    success: true
  };
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
