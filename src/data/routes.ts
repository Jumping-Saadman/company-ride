import { RouteDefinition } from "../types";
import { computeRouteMetrics } from "../lib/geo";
import { AVERAGE_SPEED_KMH } from "./constants";

// Coordinates are [lng, lat] tuples, ordered from start to end, with
// intermediate waypoints roughly following real Dhaka road corridors so the
// simulated vehicle appears to travel along streets rather than a straight line.

type RouteSeed = Omit<RouteDefinition, "distanceKm" | "durationMinutes">;

const ROUTE_SEEDS: RouteSeed[] = [
  {
    id: "route-hq-factory",
    name: "HQ to Factory",
    fromLocationId: "loc-hq",
    toLocationId: "loc-factory",
    coordinates: [
      [90.4257, 23.758],
      [90.4198, 23.7592],
      [90.4127, 23.7601],
      [90.4066, 23.7599],
      [90.4011, 23.7593],
      [90.3971, 23.7612],
      [90.3948, 23.7649],
      [90.3945, 23.7669],
      [90.3958, 23.7686],
    ],
  },
  {
    id: "route-hq-clienta",
    name: "HQ to CA Bhaban",
    fromLocationId: "loc-hq",
    toLocationId: "loc-client-a",
    coordinates: [
      [90.4257, 23.758],
      [90.4198, 23.7592],
      [90.4127, 23.7601],
      [90.4066, 23.7599],
      [90.4011, 23.7593],
      [90.3971, 23.7573],
      [90.3949, 23.7545],
      [90.3927, 23.7517],
    ],
  },
  {
    id: "route-hq-clientb",
    name: "HQ to Gulshan-2",
    fromLocationId: "loc-hq",
    toLocationId: "loc-client-b",
    coordinates: [
      [90.4257, 23.758],
      [90.4272, 23.7642],
      [90.4258, 23.7698],
      [90.4211, 23.7745],
      [90.4159, 23.7801],
      [90.4111, 23.7857],
      [90.4078, 23.7925],
    ],
  },
  {
    id: "route-branch-airport",
    name: "Banani to Airport",
    fromLocationId: "loc-branch",
    toLocationId: "loc-airport",
    coordinates: [
      [90.4066, 23.7937],
      [90.4048, 23.7989],
      [90.4021, 23.8041],
      [90.3998, 23.8104],
      [90.3979, 23.8172],
      [90.3958, 23.8241],
      [90.3949, 23.8312],
      [90.3961, 23.8378],
      [90.3978, 23.8433],
    ],
  },
];

export const ROUTES: RouteDefinition[] = ROUTE_SEEDS.map((seed) => {
  const { distanceKm } = computeRouteMetrics(seed.coordinates);
  const durationMinutes = Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60);
  return { ...seed, distanceKm: Math.round(distanceKm * 10) / 10, durationMinutes };
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
