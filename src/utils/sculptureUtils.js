import esculturasData from '../data/esculturasResistencia.json';

const STORAGE_KEY = 'cct_unlocked_sculptures';
export const BASE_SCULPTURE_URL = 'https://museoacieloabierto.org/es/catalogo/escultura/';

/**
 * Retorna la URL oficial de la ficha de la obra en el catálogo de Fundación Urunday
 */
export function getSculptureUrl(rawId) {
  if (!rawId) return 'https://museoacieloabierto.org/es/catalogo';
  const id = typeof rawId === 'string' ? rawId.replace(/\D/g, '') : rawId;
  return `${BASE_SCULPTURE_URL}${id}`;
}

/**
 * Fórmula de Haversine: Calcula la distancia en metros entre dos coordenadas [lat, lng]
 */
export function calculateDistanceMeters(coord1, coord2) {
  if (!coord1 || !coord2) return Infinity;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371e3; // Radio de la Tierra en metros
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Busca si existe alguna escultura cercana a un punto o a lo largo del trazado de una calle.
 * @param {Array|Object} target - Puede ser [lat, lng], o un objeto calle con center, points o path.
 * @param {number} maxDistanceMeters - Radio máximo en metros (default: 250m)
 * @returns {Object|null} Escultura más cercana encontrada o null.
 */
export function findNearbySculpture(target, maxDistanceMeters = 250) {
  if (!target || !Array.isArray(esculturasData)) return null;

  // Extraer puntos a evaluar según la forma del objeto de entrada
  let pointsToTest = [];
  if (Array.isArray(target) && typeof target[0] === 'number') {
    pointsToTest = [target];
  } else if (target.center && Array.isArray(target.center)) {
    pointsToTest = [target.center];
  } else if (Array.isArray(target.points)) {
    pointsToTest = target.points;
  } else if (Array.isArray(target.path)) {
    pointsToTest = target.path;
  } else if (Array.isArray(target.coordinates)) {
    pointsToTest = target.coordinates;
  }

  if (pointsToTest.length === 0) return null;

  let closestSculpture = null;
  let minDistance = Infinity;

  for (const sculpture of esculturasData) {
    if (!sculpture.coordinates || !Array.isArray(sculpture.coordinates)) continue;

    // Comparar contra cada vértice de la calle para mayor precisión
    for (const pt of pointsToTest) {
      const dist = calculateDistanceMeters(pt, sculpture.coordinates);
      if (dist <= maxDistanceMeters && dist < minDistance) {
        minDistance = dist;
        closestSculpture = {
          ...sculpture,
          distanceMeters: Math.round(dist)
        };
      }
    }
  }

  return closestSculpture;
}

/**
 * Obtiene el listado de IDs numéricos de esculturas desbloqueadas desde localStorage.
 */
export function getUnlockedSculptureIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(x => Number(typeof x === 'string' ? x.replace(/\D/g, '') : x))
      .filter(n => !isNaN(n) && n > 0);
  } catch (e) {
    console.warn('Error reading unlocked sculptures from localStorage:', e);
    return [];
  }
}

/**
 * Registra una escultura como desbloqueada en localStorage.
 * @param {number|string} rawCatalogId - ID de la escultura
 * @returns {Object} { isNewUnlock: boolean, totalUnlocked: number }
 */
export function unlockSculpture(rawCatalogId) {
  try {
    const catalogId = Number(typeof rawCatalogId === 'string' ? rawCatalogId.replace(/\D/g, '') : rawCatalogId);
    if (isNaN(catalogId) || catalogId <= 0) {
      return { isNewUnlock: false, totalUnlocked: 0 };
    }

    const current = getUnlockedSculptureIds();
    if (!current.includes(catalogId)) {
      const updated = [...current, catalogId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { isNewUnlock: true, totalUnlocked: updated.length };
    }
    return { isNewUnlock: false, totalUnlocked: current.length };
  } catch (e) {
    console.warn('Error saving unlocked sculpture to localStorage:', e);
    return { isNewUnlock: false, totalUnlocked: 0 };
  }
}

/**
 * Retorna estadísticas de colección para el Álbum
 */
export function getAlbumStats() {
  const total = Array.isArray(esculturasData) ? esculturasData.length : 0;
  const unlockedIds = getUnlockedSculptureIds();
  const unlockedCount = esculturasData.filter(s => unlockedIds.includes(Number(s.catalogId))).length;
  const percent = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return {
    total,
    unlockedCount,
    percent,
    catalog: esculturasData
  };
}
