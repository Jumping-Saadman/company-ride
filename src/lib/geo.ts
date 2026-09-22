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
