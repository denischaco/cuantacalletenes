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
