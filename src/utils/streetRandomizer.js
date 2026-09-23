import streetsData from '../data/resistenciaStreets.json';
import landmarksData from '../data/landmarks.json';
import sponsorsData from '../data/sponsors.json';
import { calculateHaversineDistance } from './geoUtils.js';

/**
 * Parametric Street Randomizer Engine
 * Generates random rounds of streets matching zone, landmark, or radius filters.
 * Injects at most 1 sponsored round per 5-round match (Brand Guardian Rule).
 */
export function getRandomStreetRound({
  zoneId = 'centro',
  count = 5,
  difficulty = null,
  excludeIds = [],
  includeSponsored = true
} = {}) {
  const selectedZone = landmarksData.find(z => z.id === zoneId) || landmarksData[0];
  const [centerLat, centerLon] = selectedZone.center;
  const radiusMeters = (selectedZone.radiusKm || 2) * 1000;

  // Filter streets matching zone constraint: street must actually pass through the zone radius
  let candidateStreets = streetsData.filter(street => {
    if (excludeIds.includes(street.id)) return false;

    if (zoneId === 'toda_ciudad') return true;

    // Direct spatial test: street must have points within the zone radius
    if (street.path && street.path.length > 0) {
      const hasPointInZone = street.path.some(pt => {
        return calculateHaversineDistance(centerLat, centerLon, pt[0], pt[1]) <= radiusMeters;
      });
      if (hasPointInZone) return true;
    }

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

  // Check for applicable sponsor for this zone (Brand Guardian: exactly 1 per 5 rounds)
  let sponsoredStreet = null;
  if (includeSponsored && Array.isArray(sponsorsData) && sponsorsData.length > 0) {
    const matchingSponsors = sponsorsData.filter(sp => {
      if (sp.active === false) return false;
      // 'pase_barrial' only appears on the map, not in guessing rounds
      if (sp.plan === 'pase_barrial') return false;
      if (zoneId === 'toda_ciudad' || zoneId === 'macrocentro') return true;
      return sp.zoneId === zoneId;
    });

    if (matchingSponsors.length > 0) {
      const chosenSponsor = matchingSponsors[Math.floor(Math.random() * matchingSponsors.length)];
      sponsoredStreet = {
        id: chosenSponsor.targetStreet.id,
        name: chosenSponsor.targetStreet.name,
        shortName: chosenSponsor.targetStreet.shortStreet || chosenSponsor.targetStreet.name,
        number: chosenSponsor.targetStreet.number || '683',
        aliases: chosenSponsor.targetStreet.aliases || [],
        trivia: chosenSponsor.targetStreet.trivia || '',
        center: chosenSponsor.coordinates,
        path: [
          chosenSponsor.coordinates,
          [chosenSponsor.coordinates[0] + 0.00015, chosenSponsor.coordinates[1] + 0.00015]
        ],
        isSponsored: true,
        sponsor: chosenSponsor
      };
    }
  }

  // Pick regular streets
  const regularCount = sponsoredStreet && count > 1 ? count - 1 : count;
  const picked = [];
  const pickedIds = new Set(excludeIds);

  for (const st of shuffled) {
    if (!pickedIds.has(st.id)) {
      picked.push(st);
      pickedIds.add(st.id);
      if (picked.length === regularCount) break;
    }
  }

  // Inject sponsored street at round 3 (index 2) per Business Plan specification
  if (sponsoredStreet) {
    const insertIdx = picked.length >= 2 ? 2 : picked.length;
    picked.splice(insertIdx, 0, sponsoredStreet);
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

/**
 * Generates multiple choice options for a round (1 correct + 3 plausible distractors).
 */
export function generateRoundOptions(correctStreet, allStreets = streetsData, count = 4) {
  if (!correctStreet) return [];

  // Special options for sponsored rounds: simulate realistic heights/numbers on all distractors
  if (correctStreet.isSponsored) {
    const targetNumber = correctStreet.number || correctStreet.sponsor?.targetStreet?.number || '683';
    let targetName = correctStreet.name || 'Calle French 683';
    if (!/\d+/.test(targetName)) {
      targetName = `${targetName} ${targetNumber}`;
    }

    const simulatedHeights = [450, 720, 580, 340, 860];
    let simIdx = 0;

    const rawAlternatives = Array.isArray(correctStreet.sponsor?.alternativeStreets) && correctStreet.sponsor.alternativeStreets.length > 0
      ? correctStreet.sponsor.alternativeStreets
      : allStreets.filter(s => s.id !== correctStreet.id).slice(0, count - 1);

    const distractors = rawAlternatives.slice(0, count - 1).map((alt) => {
      let altName = alt.name;
      if (!/\d+/.test(altName)) {
        const num = alt.number || simulatedHeights[simIdx++ % simulatedHeights.length];
        altName = `${altName} ${num}`;
      }
      return {
        id: alt.id,
        name: altName
      };
    });

    const opts = [
      { id: correctStreet.id, name: targetName },
      ...distractors
    ];

    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }

  const distractorsPool = allStreets.filter(s => s.id !== correctStreet.id);

  // Shuffle candidate pool
  const shuffled = [...distractorsPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Prefer streets of similar type or category if possible
  const sameCategory = shuffled.filter(s => s.category === correctStreet.category);
  const otherCategory = shuffled.filter(s => s.category !== correctStreet.category);
  const prioritized = [...sameCategory, ...otherCategory];

  const selectedDistractors = [];
  const pickedNames = new Set([correctStreet.name]);

  for (const s of prioritized) {
    if (!pickedNames.has(s.name)) {
      selectedDistractors.push(s);
      pickedNames.add(s.name);
      if (selectedDistractors.length === count - 1) break;
    }
  }

  const options = [correctStreet, ...selectedDistractors];

  // Shuffle final options so correct isn't always first
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
}

