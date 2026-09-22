import { RouteDefinition } from "../types";
import { computeRouteMetrics, dedupeConsecutive } from "../lib/geo";
import { AVERAGE_SPEED_KMH } from "./constants";
import {
  HQ_FACTORY_GEOMETRY,
  HQ_CLIENT_A_GEOMETRY,
  HQ_CLIENT_B_GEOMETRY,
  BRANCH_AIRPORT_GEOMETRY,
} from "./roadGeometry";

// Coordinates are real road-snapped [lng, lat] polylines (see roadGeometry.ts)
// so the simulated vehicle travels along actual Dhaka streets rather than a
// straight-line or hand-drawn path.

type RouteSeed = Omit<RouteDefinition, "distanceKm" | "durationMinutes">;

const ROUTE_SEEDS: RouteSeed[] = [
  {
    id: "route-hq-factory",
    name: "HQ to Factory",
    fromLocationId: "loc-hq",
    toLocationId: "loc-factory",
    coordinates: HQ_FACTORY_GEOMETRY,
  },
  {
    id: "route-hq-clienta",
    name: "HQ to CA Bhaban",
    fromLocationId: "loc-hq",
    toLocationId: "loc-client-a",
    coordinates: HQ_CLIENT_A_GEOMETRY,
  },
  {
    id: "route-hq-clientb",
    name: "HQ to Gulshan-2",
    fromLocationId: "loc-hq",
    toLocationId: "loc-client-b",
    coordinates: HQ_CLIENT_B_GEOMETRY,
  },
  {
    id: "route-branch-airport",
    name: "Banani to Airport",
    fromLocationId: "loc-branch",
    toLocationId: "loc-airport",
    coordinates: BRANCH_AIRPORT_GEOMETRY,
  },
];

export const ROUTES: RouteDefinition[] = ROUTE_SEEDS.map((seed) => {
  const coordinates = dedupeConsecutive(seed.coordinates);
  const { distanceKm } = computeRouteMetrics(coordinates);
  const durationMinutes = Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60);
  return { ...seed, coordinates, distanceKm: Math.round(distanceKm * 10) / 10, durationMinutes };
});

export const getRouteById = (id: string): RouteDefinition | undefined =>
  ROUTES.find((r) => r.id === id);

export const getRouteBetween = (
  fromLocationId: string,
  toLocationId: string,
): RouteDefinition | undefined =>
  ROUTES.find(
    (r) =>
      r.fromLocationId === fromLocationId && r.toLocationId === toLocationId,
  ) ??
  ROUTES.find(
    (r) =>
      r.fromLocationId === toLocationId && r.toLocationId === fromLocationId,
  );
