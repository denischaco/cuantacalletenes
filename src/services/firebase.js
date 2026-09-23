import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
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
 * Subscribe in real-time to the Firestore leaderboard.
 * Automatically falls back to localStorage if Firestore is unavailable.
 */
export function subscribeLeaderboard(callback) {
  // Always trigger immediately with current local cache
  const localScores = getLocalLeaderboard();
  callback(localScores);

  if (!isFirebaseAvailable || !db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'cuanta_calle_leaderboard');
    const q = query(colRef, orderBy('score', 'desc'), limit(30));

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
              rankBadge: data.rankBadge || '🧭',
              zone: data.zone || '4 Avenidas',
              date: data.date || new Date().toISOString().split('T')[0]
            };
          });

          saveLocalLeaderboard(remoteScores);
          callback(remoteScores);
        } else if (snapshot.metadata.fromCache === false) {
          // Empty collection in Firestore
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
 * Save a new score entry to Firestore and localStorage
 */
export async function saveScoreEntry(entry) {
  const newEntry = {
    name: entry.name || 'Jugador',
    score: Number(entry.score) || 0,
    rankBadge: entry.rankBadge || '🧭',
    zone: entry.zone || '4 Avenidas',
    date: entry.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  // Update local cache immediately
  const current = getLocalLeaderboard();
  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 30);
  saveLocalLeaderboard(updated);

  // Send to Firestore if available
  if (isFirebaseAvailable && db) {
    try {
      const colRef = collection(db, 'cuanta_calle_leaderboard');
      const docRef = await addDoc(colRef, {
        ...newEntry,
        timestamp: serverTimestamp()
      });
      console.log('✅ Récord guardado exitosamente en Firestore (ID:', docRef.id, '):', newEntry);
    } catch (err) {
      console.error('❌ No se pudo guardar en Firestore (se guardó solo local):', err.message, err);
    }
  }

  return updated;
}

/**
 * Send a test score to create/verify the collection in Firestore
 */
export async function sendTestScoreToFirestore() {
  const testEntry = {
    name: 'Prueba Moderación',
    score: 10,
    rankBadge: '🧪',
    zone: 'Centro',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  if (!isFirebaseAvailable || !db) {
    return {
      success: false,
      error: 'Firebase no está inicializado. Revisá la configuración en .env'
    };
  }

  try {
    const colRef = collection(db, 'cuanta_calle_leaderboard');
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

  // Delete from Firestore if connected and has document ID
  if (isFirebaseAvailable && db && id) {
    try {
      await deleteDoc(doc(db, 'cuanta_calle_leaderboard', id));
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
  if (isFirebaseAvailable && db) {
    try {
      const colRef = collection(db, 'cuanta_calle_leaderboard');
      const snapshot = await getDocs(colRef);
      const deletePromises = snapshot.docs.map((d) => deleteDoc(doc(db, 'cuanta_calle_leaderboard', d.id)));
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

  // Save to Firestore if available
  if (isFirebaseAvailable && db) {
    try {
      const colRef = collection(db, 'sponsorship_leads');
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
