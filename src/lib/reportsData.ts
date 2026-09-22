import { AppState } from "../state/types";
import { getLocationById } from "../data/locations";
import { RideRequestStatus, TripStatus } from "../types";

export interface WeeklyPoint {
  week: string;
  trips: number;
}

// Deterministic illustrative trend for the weeks preceding the seeded data
// window, so the chart reads as a believable multi-week history rather than
// the ~2 weeks of trips actually seeded.
const HISTORICAL_WEEKLY_BASE = [18, 22, 19, 25];

export function getWeeklyTrips(state: AppState): WeeklyPoint[] {
  const completed = state.trips.filter((t) => t.status === TripStatus.COMPLETED);
  const currentWeekCount = completed.length + state.trips.filter(
    (t) => t.status !== TripStatus.COMPLETED && t.status !== TripStatus.CANCELLED,
  ).length;

  return [
    ...HISTORICAL_WEEKLY_BASE.map((trips, i) => ({ week: `Week ${i + 1}`, trips })),
    { week: "This Week", trips: currentWeekCount },
  ];
}

export interface DestinationPoint {
  name: string;
  trips: number;
}

export function getTripsByDestination(state: AppState): DestinationPoint[] {
  const counts = new Map<string, number>();
  state.trips.forEach((t) => {
    counts.set(t.destinationLocationId, (counts.get(t.destinationLocationId) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([locId, trips]) => ({ name: getLocationById(locId)?.name ?? locId, trips }))
    .sort((a, b) => b.trips - a.trips);
}

export interface StatusSplit {
  name: string;
  value: number;
}

export function getCompletedVsCancelled(state: AppState): StatusSplit[] {
  const completed = state.trips.filter((t) => t.status === TripStatus.COMPLETED).length;
  const cancelledTrips = state.trips.filter((t) => t.status === TripStatus.CANCELLED).length;
  const rejectedRequests = state.rideRequests.filter(
    (r) => r.status === RideRequestStatus.REJECTED || r.status === RideRequestStatus.CANCELLED,
  ).length;
  return [
    { name: "Completed", value: completed },
    { name: "Cancelled / Rejected", value: cancelledTrips + rejectedRequests },
  ];
}

export interface DriverUtilizationPoint {
  name: string;
  trips: number;
}

export function getDriverUtilization(state: AppState): DriverUtilizationPoint[] {
  return state.drivers
    .map((d) => ({
      name: d.name.split(" ")[0],
      trips: state.trips.filter((t) => t.driverId === d.id).length,
    }))
    .sort((a, b) => b.trips - a.trips);
}

export interface MonthlyPoint {
  month: string;
  trips: number;
}

const MONTHLY_BASE = [
  { month: "Apr", trips: 64 },
  { month: "May", trips: 71 },
  { month: "Jun", trips: 68 },
  { month: "Jul", trips: 79 },
  { month: "Aug", trips: 85 },
  { month: "Sep", trips: 90 },
];

export function getMonthlyVolume(_state: AppState): MonthlyPoint[] {
  return MONTHLY_BASE;
}
