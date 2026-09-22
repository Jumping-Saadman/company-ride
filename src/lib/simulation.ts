import { RouteDefinition, SimulationSpeed } from "../types";
import { computeRouteMetrics, interpolateAlongRoute } from "./geo";
import { AVERAGE_SPEED_KMH } from "../data/constants";

export interface SimulationSnapshot {
  lat: number;
  lng: number;
  progress: number; // 0-100
  distanceRemainingKm: number;
  etaMinutes: number;
}

const metricsCache = new Map<
  string,
  ReturnType<typeof computeRouteMetrics>
>();

function getMetrics(route: RouteDefinition) {
  let metrics = metricsCache.get(route.id);
  if (!metrics) {
    metrics = computeRouteMetrics(route.coordinates);
    metricsCache.set(route.id, metrics);
  }
  return metrics;
}

/**
 * Computes a full simulation snapshot for a route at a given progress fraction (0-1).
 */
export function getSnapshotAtProgress(
  route: RouteDefinition,
  progressFraction: number,
): SimulationSnapshot {
  const { distanceKm, cumulativeKm } = getMetrics(route);
  const clamped = Math.min(1, Math.max(0, progressFraction));
  const { lat, lng } = interpolateAlongRoute(
    route.coordinates,
    cumulativeKm,
    distanceKm,
    clamped,
  );
  const distanceRemainingKm = Math.max(0, distanceKm * (1 - clamped));
  const etaMinutes = (distanceRemainingKm / AVERAGE_SPEED_KMH) * 60;

  return {
    lat,
    lng,
    progress: Math.round(clamped * 1000) / 10,
    distanceRemainingKm: Math.round(distanceRemainingKm * 10) / 10,
    etaMinutes: Math.max(0, Math.round(etaMinutes)),
  };
}

/**
 * Given elapsed real milliseconds and a playback speed multiplier, returns the
 * additional progress fraction covered along the route (assuming constant
 * average city-driving speed).
 */
export function progressDeltaForElapsed(
  route: RouteDefinition,
  elapsedMs: number,
  speed: SimulationSpeed,
): number {
  const { distanceKm } = getMetrics(route);
  if (distanceKm <= 0) return 1;
  const hoursElapsed = (elapsedMs / 3_600_000) * speed;
  const kmCovered = hoursElapsed * AVERAGE_SPEED_KMH;
  return kmCovered / distanceKm;
}
