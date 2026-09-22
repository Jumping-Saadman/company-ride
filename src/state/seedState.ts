import { AppState } from "./types";
import { EMPLOYEES } from "../data/employees";
import { DRIVERS } from "../data/drivers";
import {
  SEED_NOTIFICATIONS,
  SEED_RIDE_REQUESTS,
  SEED_TRIPS,
} from "../data/seed";

export function createSeedState(): AppState {
  return {
    currentUser: { role: "admin" },
    employees: EMPLOYEES.map((e) => ({ ...e })),
    drivers: DRIVERS.map((d) => ({ ...d })),
    rideRequests: SEED_RIDE_REQUESTS.map((r) => ({ ...r })),
    trips: SEED_TRIPS.map((t) => ({ ...t, timeline: [...t.timeline] })),
    notifications: SEED_NOTIFICATIONS.map((n) => ({ ...n })),
    playback: {},
  };
}
