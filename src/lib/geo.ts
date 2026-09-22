export type LngLat = [number, number];

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(a: LngLat, b: LngLat): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Compass bearing in degrees (0 = north, 90 = east) from point a to point b.
 */
export function bearingBetween(a: LngLat, b: LngLat): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

/**
 * Removes consecutive duplicate points. A zero-length segment (common at
 * OSRM-snapped start/end nodes) can hang MapLibre's GeoJSON tiling worker,
 * leaving the source stuck "loading" and the line invisible with no error.
 */
export function dedupeConsecutive(coordinates: LngLat[]): LngLat[] {
  const result: LngLat[] = [];
  for (const c of coordinates) {
    const last = result[result.length - 1];
    if (!last || last[0] !== c[0] || last[1] !== c[1]) result.push(c);
  }
  return result;
}

export interface RouteMetrics {
  distanceKm: number;
  cumulativeKm: number[]; // cumulative distance at each coordinate index
}

export function computeRouteMetrics(coordinates: LngLat[]): RouteMetrics {
  const cumulativeKm: number[] = [0];
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += haversineDistanceKm(coordinates[i - 1], coordinates[i]);
    cumulativeKm.push(total);
  }
  return { distanceKm: total, cumulativeKm };
}

/**
 * Interpolates a position along a polyline given a fractional progress [0,1].
 */
export function interpolateAlongRoute(
  coordinates: LngLat[],
  cumulativeKm: number[],
  totalKm: number,
  progress: number,
): { lng: number; lat: number } {
  const clamped = Math.min(1, Math.max(0, progress));
  const targetKm = clamped * totalKm;

  if (clamped <= 0) {
    const [lng, lat] = coordinates[0];
    return { lng, lat };
  }
  if (clamped >= 1) {
    const [lng, lat] = coordinates[coordinates.length - 1];
    return { lng, lat };
  }

  let segmentIndex = 0;
  for (let i = 1; i < cumulativeKm.length; i++) {
    if (cumulativeKm[i] >= targetKm) {
      segmentIndex = i - 1;
      break;
    }
  }

  const segStart = cumulativeKm[segmentIndex];
  const segEnd = cumulativeKm[segmentIndex + 1];
  const segLength = segEnd - segStart || 1;
  const segProgress = (targetKm - segStart) / segLength;

  const [lng1, lat1] = coordinates[segmentIndex];
  const [lng2, lat2] = coordinates[segmentIndex + 1];

  return {
    lng: lng1 + (lng2 - lng1) * segProgress,
    lat: lat1 + (lat2 - lat1) * segProgress,
  };
}
