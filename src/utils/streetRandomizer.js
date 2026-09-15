import streetsData from '../data/resistenciaStreets.json';
import landmarksData from '../data/landmarks.json';
import { calculateHaversineDistance } from './geoUtils';

/**
 * Parametric Street Randomizer Engine
 * Generates random rounds of streets matching zone, landmark, or radius filters.
 */
export function getRandomStreetRound({
  zoneId = 'centro',
  count = 5,
  difficulty = null,
  excludeIds = []
} = {}) {
  const selectedZone = landmarksData.find(z => z.id === zoneId) || landmarksData[0];
  const [centerLat, centerLon] = selectedZone.center;
  const radiusMeters = (selectedZone.radiusKm || 2) * 1000;

  // Filter streets matching zone or radius constraint
  let candidateStreets = streetsData.filter(street => {
    if (excludeIds.includes(street.id)) return false;

    // Direct zone ID match
    if (street.zoneIds && street.zoneIds.includes(zoneId)) {
      return true;
    }

    // Spatial distance match to the selected zone/landmark center
    const distToCenter = calculateHaversineDistance(
      centerLat, centerLon,
      street.center[0], street.center[1]
    );

    return distToCenter <= radiusMeters;
  });

  // Apply difficulty filter if specified and enough candidates exist
  if (difficulty && difficulty !== 'todos') {
    const diffCandidates = candidateStreets.filter(s => s.difficulty === difficulty);
    if (diffCandidates.length >= count) {
      candidateStreets = diffCandidates;
    }
  }

  // Graceful fallback if too few candidates in this specific radius
  if (candidateStreets.length < count) {
    const backupPool = streetsData.filter(s => !excludeIds.includes(s.id));
    candidateStreets = [...candidateStreets, ...backupPool];
  }

  // Fisher-Yates Shuffle
  const shuffled = [...candidateStreets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Pick unique streets up to count
  const picked = [];
  const pickedIds = new Set(excludeIds);

  for (const st of shuffled) {
    if (!pickedIds.has(st.id)) {
      picked.push(st);
      pickedIds.add(st.id);
      if (picked.length === count) break;
    }
  }

  return picked;
}

/**
 * Returns rank data corresponding to a total score from ranks.json
 */
export function getRankForScore(score, ranks) {
  const found = ranks.find(r => score >= r.minScore && score <= r.maxScore);
  return found || ranks[ranks.length - 1];
}
