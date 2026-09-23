/**
 * Calculates the Haversine distance between two geographic coordinates in meters.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculates the perpendicular distance from point P to line segment AB,
 * returning the minimum distance in meters and the closest projected point.
 */
export function distanceToSegment(p, a, b) {
  const latP = p[0], lonP = p[1];
  const latA = a[0], lonA = a[1];
  const latB = b[0], lonB = b[1];

  const dx = lonB - lonA;
  const dy = latB - latA;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return {
      distance: calculateHaversineDistance(latP, lonP, latA, lonA),
      closestPoint: [latA, lonA]
    };
  }

  // Projection parameter t
  let t = ((lonP - lonA) * dx + (latP - latA) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const closestLat = latA + t * dy;
  const closestLon = lonA + t * dx;

  return {
    distance: calculateHaversineDistance(latP, lonP, closestLat, closestLon),
    closestPoint: [closestLat, closestLon]
  };
}

/**
 * Calculates minimum distance from user pin to any segment of a street polyline.
 */
export function calculateDistanceToStreet(userCoord, street) {
  if (!street.path || street.path.length === 0) {
    const dist = calculateHaversineDistance(
      userCoord[0], userCoord[1],
      street.center[0], street.center[1]
    );
    return { distance: Math.round(dist), closestPoint: street.center };
  }

  if (street.path.length === 1) {
    const dist = calculateHaversineDistance(
      userCoord[0], userCoord[1],
      street.path[0][0], street.path[0][1]
    );
    return { distance: Math.round(dist), closestPoint: street.path[0] };
  }

  let minDistance = Infinity;
  let bestPoint = street.center;

  for (let i = 0; i < street.path.length - 1; i++) {
    const pA = street.path[i];
    const pB = street.path[i + 1];
    const result = distanceToSegment(userCoord, pA, pB);
    if (result.distance < minDistance) {
      minDistance = result.distance;
      bestPoint = result.closestPoint;
    }
  }

  return {
    distance: Math.round(minDistance),
    closestPoint: bestPoint
  };
}

/**
 * Exponential score decay:
 * - Within 60 meters: 1000 points (bullseye!)
 * - Decays smoothly towards 0 points at ~2.5 km.
 */
export function calculateScore(distanceMeters) {
  if (distanceMeters <= 60) return 1000;
  const score = Math.round(1000 * Math.exp(-distanceMeters / 650));
  return Math.max(0, Math.min(1000, score));
}

/**
 * Format meters for user display (e.g., "75 m" or "1.4 km").
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${meters} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Returns a random point along a street's path that is positioned in the middle
 * of a block (between 35% and 65% of a segment), ensuring it is on the street pavement
 * and away from intersections.
 */
export function getRandomNonIntersectionPoint(targetStreet, allStreets = [], targetZone = null) {
  if (targetStreet?.isSponsored && targetStreet?.center) {
    return targetStreet.center;
  }

  if (!targetStreet || !targetStreet.path || targetStreet.path.length < 2) {
    return targetStreet?.center || [-27.451143, -58.986508];
  }

  // Extract all valid segments from the real OpenStreetMap street geometry
  const segments = [];
  for (let i = 0; i < targetStreet.path.length - 1; i++) {
    const pA = targetStreet.path[i];
    const pB = targetStreet.path[i + 1];
    const len = calculateHaversineDistance(pA[0], pA[1], pB[0], pB[1]);
    if (len >= 15) {
      segments.push({ pA, pB, len });
    }
  }

  const allValidSegments = segments.length > 0 ? segments : [
    { pA: targetStreet.path[0], pB: targetStreet.path[targetStreet.path.length - 1], len: 25 }
  ];

  // If a targetZone is specified (e.g. 'centro' / 4 Avenidas), filter segments strictly within the zone boundary
  let validSegments = allValidSegments;
  if (targetZone && targetZone.center) {
    const zoneRadiusM = (targetZone.radiusKm || 1.05) * 1000;
    const inZoneSegments = allValidSegments.filter(seg => {
      const midLat = (seg.pA[0] + seg.pB[0]) / 2;
      const midLon = (seg.pA[1] + seg.pB[1]) / 2;
      const d = calculateHaversineDistance(midLat, midLon, targetZone.center[0], targetZone.center[1]);
      return d <= zoneRadiusM;
    });
    if (inZoneSegments.length > 0) {
      validSegments = inZoneSegments;
    }
  }

  // Helper to test perpendicular distance to another street
  const getMinDistToOtherStreet = (pt, street) => {
    let minD = Infinity;
    for (let i = 0; i < street.path.length - 1; i++) {
      const d = distanceToSegment(pt, street.path[i], street.path[i + 1]).distance;
      if (d < minD) minD = d;
    }
    return minD;
  };

  // Try attempts to find a point not close to any intersection and strictly inside the zone
  for (let attempt = 0; attempt < 60; attempt++) {
    const seg = validSegments[Math.floor(Math.random() * validSegments.length)];
    // Pick t between 0.35 and 0.65 to ensure it is in the middle of the block
    const t = 0.35 + Math.random() * 0.30;
    const pt = [
      Number((seg.pA[0] + t * (seg.pB[0] - seg.pA[0])).toFixed(6)),
      Number((seg.pA[1] + t * (seg.pB[1] - seg.pA[1])).toFixed(6))
    ];

    // Check if targetZone is given: enforce point is within zone radius
    if (targetZone && targetZone.center) {
      const zoneRadiusM = (targetZone.radiusKm || 1.05) * 1000;
      const dToCenter = calculateHaversineDistance(pt[0], pt[1], targetZone.center[0], targetZone.center[1]);
      if (dToCenter > zoneRadiusM) {
        continue;
      }
    }

    // Distance to segment endpoints should be >= 10 meters (away from corners)
    const distToA = calculateHaversineDistance(pt[0], pt[1], seg.pA[0], seg.pA[1]);
    const distToB = calculateHaversineDistance(pt[0], pt[1], seg.pB[0], seg.pB[1]);
    if (distToA < 10 || distToB < 10) continue;

    let tooClose = false;
    for (const other of allStreets) {
      if (other.id === targetStreet.id) continue;
      const d = getMinDistToOtherStreet(pt, other);
      if (d < 18) { // closer than 18 meters to another street intersection
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      return pt;
    }
  }

  // Fallback: middle of longest valid segment
  validSegments.sort((a, b) => b.len - a.len);
  const fallbackSeg = validSegments[0];
  return [
    Number((fallbackSeg.pA[0] + 0.5 * (fallbackSeg.pB[0] - fallbackSeg.pA[0])).toFixed(6)),
    Number((fallbackSeg.pA[1] + 0.5 * (fallbackSeg.pB[1] - fallbackSeg.pA[1])).toFixed(6))
  ];
}

/**
 * Returns an array of normalized acceptable string variations for a street name,
 * preserving accents and diéresis.
 */
export function getStreetAliases(street) {
  if (!street || !street.name) return [];

  const rawName = street.name.trim();
  const lower = rawName.toLowerCase();
  const aliases = new Set([lower]);

  // Include explicit custom aliases if defined on the street object
  if (Array.isArray(street.aliases)) {
    for (const a of street.aliases) {
      if (typeof a === 'string') aliases.add(a.toLowerCase().trim());
    }
  }

  // Strip parenthetical descriptions like " (Laguna Argüello)"
  const withoutParens = lower.replace(/\s*\([^)]*\)/g, '').trim();
  if (withoutParens) aliases.add(withoutParens);

  // Clean prefix versions
  const prefixes = [
    'calle ',
    'avenida ',
    'av. ',
    'av ',
    'peatonal / calle ',
    'peatonal '
  ];

  for (const prefix of prefixes) {
    if (withoutParens.startsWith(prefix)) {
      const stripped = withoutParens.slice(prefix.length).trim();
      if (stripped) {
        aliases.add(stripped);
        // Add common variations
        if (prefix === 'avenida ') {
          aliases.add(`av. ${stripped}`);
          aliases.add(`av ${stripped}`);
        }
      }
    }
  }

  // Handle dot abbreviation variations e.g. "julio a. roca" vs "julio a roca"
  const aliasesArray = Array.from(aliases);
  for (const a of aliasesArray) {
    if (a.includes('.')) {
      aliases.add(a.replace(/\./g, '').replace(/\s+/g, ' ').trim());
    }
  }

  return Array.from(aliases);
}

/**
 * Validates a user guess against a street.
 * Respects accents/diéresis (case-insensitive).
 * Detects if the guess was close but lacked accents.
 * For sponsored streets (with an address/number), detects if the exact address with number was guessed (+4 pts).
 */
export function validateStreetGuess(rawGuess, targetStreet) {
  if (!rawGuess || typeof rawGuess !== 'string' || !targetStreet) {
    return { isCorrect: false, missedAccents: false, isExactAddress: false };
  }

  const cleanGuess = rawGuess.trim().toLowerCase().replace(/\s+/g, ' ');
  const aliases = getStreetAliases(targetStreet);

  // Extract target number if available (from targetStreet.number, sponsor address, etc.)
  const targetNumber = String(
    targetStreet.number ||
    targetStreet.sponsor?.targetStreet?.number ||
    targetStreet.sponsor?.address?.match(/\d+/)?.[0] ||
    ''
  ).trim();

  // Helper to remove accents
  const stripAccents = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const hasTargetNumber = Boolean(
    targetNumber &&
    (new RegExp(`\\b${targetNumber}\\b`).test(cleanGuess) || cleanGuess.includes(targetNumber))
  );

  // Text version removing target number and common prefixes like "al", "n°", etc.
  const textWithoutTargetNumber = targetNumber
    ? cleanGuess
        .replace(new RegExp(`\\b${targetNumber}\\b`, 'g'), '')
        .replace(/\b(al|nº|n°|n|#|numero|número)\b/g, '')
        .trim()
        .replace(/\s+/g, ' ')
    : cleanGuess;

  // 1. Direct match with aliases (exact casing handled by lowercasing)
  if (aliases.includes(cleanGuess)) {
    const isExactAddress = Boolean(hasTargetNumber);
    return { isCorrect: true, missedAccents: false, isExactAddress };
  }

  // 2. Match after separating number (e.g. user wrote "French 683" or "French al 683")
  if (textWithoutTargetNumber && aliases.includes(textWithoutTargetNumber)) {
    return {
      isCorrect: true,
      missedAccents: false,
      isExactAddress: hasTargetNumber
    };
  }

  // 3. Match street even if another number was typed (e.g. user typed "French 200")
  const textWithoutAnyNumbers = cleanGuess
    .replace(/\b\d+\b/g, '')
    .replace(/\b(al|nº|n°|n|#|numero|número)\b/g, '')
    .trim()
    .replace(/\s+/g, ' ');

  if (targetNumber && textWithoutAnyNumbers && aliases.includes(textWithoutAnyNumbers)) {
    return {
      isCorrect: true,
      missedAccents: false,
      isExactAddress: hasTargetNumber
    };
  }

  // 4. Check if they would have matched if accents were removed
  const unaccentedGuess = stripAccents(cleanGuess);
  const unaccentedText = stripAccents(textWithoutTargetNumber);
  const unaccentedAnyNumbers = stripAccents(textWithoutAnyNumbers);
  const unaccentedAliases = aliases.map(stripAccents);

  if (
    unaccentedAliases.includes(unaccentedGuess) ||
    (unaccentedText && unaccentedAliases.includes(unaccentedText)) ||
    (targetNumber && unaccentedAnyNumbers && unaccentedAliases.includes(unaccentedAnyNumbers))
  ) {
    return { isCorrect: false, missedAccents: true, isExactAddress: hasTargetNumber };
  }

  return { isCorrect: false, missedAccents: false, isExactAddress: false };
}

