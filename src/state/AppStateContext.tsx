import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { ReactNode } from "react";
import { appReducer } from "./reducer";
import { AppState, NewRideRequestInput } from "./types";
import { createSeedState } from "./seedState";
import {
  DemoUser,
  DriverStatus,
  NotificationAudience,
  SimulationSpeed,
} from "../types";

const STORAGE_KEY = "nexacore-ride-state-v1";

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.employees || !parsed.drivers || !parsed.trips) {
      return createSeedState();
    }
    return parsed;
  } catch {
    return createSeedState();
  }
}

interface AppActions {
  switchUser: (user: DemoUser) => void;
  submitRideRequest: (input: NewRideRequestInput) => void;
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  assignDriver: (requestId: string, driverId: string) => void;
  advanceTripStatus: (tripId: string) => void;
  cancelTrip: (tripId: string) => void;
  setDriverStatus: (driverId: string, status: DriverStatus) => void;
  updateTripPosition: (
    tripId: string,
    snapshot: {
      lat: number;
      lng: number;
      progress: number;
      distanceRemainingKm: number;
      etaMinutes: number;
    },
  ) => void;
  setPlayback: (
    tripId: string,
    opts: { isPlaying?: boolean; speed?: SimulationSpeed },
  ) => void;
  resetPlayback: (tripId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (
    audience: NotificationAudience,
    recipientId?: string,
  ) => void;
  resetDemoData: () => void;
  simulateNewRequest: () => void;
  startSampleTrip: () => void;
  completeSampleTrip: () => void;
}

interface AppStateContextValue {
  state: AppState;
  actions: AppActions;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage unavailable (e.g. private browsing quota) - ignore.
    }
  }, [state]);

  const actions = useMemo<AppActions>(
    () => ({
      switchUser: (user) => dispatch({ type: "SWITCH_USER", user }),
      submitRideRequest: (input) =>
        dispatch({ type: "SUBMIT_RIDE_REQUEST", input }),
      approveRequest: (requestId) =>
        dispatch({ type: "APPROVE_REQUEST", requestId }),
      rejectRequest: (requestId) =>
        dispatch({ type: "REJECT_REQUEST", requestId }),
      cancelRequest: (requestId) =>
        dispatch({ type: "CANCEL_REQUEST", requestId }),
      assignDriver: (requestId, driverId) =>
        dispatch({ type: "ASSIGN_DRIVER", requestId, driverId }),
      advanceTripStatus: (tripId) =>
        dispatch({ type: "ADVANCE_TRIP_STATUS", tripId }),
      cancelTrip: (tripId) => dispatch({ type: "CANCEL_TRIP", tripId }),
      setDriverStatus: (driverId, status) =>
        dispatch({ type: "SET_DRIVER_STATUS", driverId, status }),
      updateTripPosition: (tripId, snapshot) =>
        dispatch({ type: "UPDATE_TRIP_POSITION", tripId, ...snapshot }),
      setPlayback: (tripId, opts) =>
        dispatch({ type: "SET_PLAYBACK", tripId, ...opts }),
      resetPlayback: (tripId) => dispatch({ type: "RESET_PLAYBACK", tripId }),
      markNotificationRead: (notificationId) =>
        dispatch({ type: "MARK_NOTIFICATION_READ", notificationId }),
      markAllNotificationsRead: (audience, recipientId) =>
        dispatch({
          type: "MARK_ALL_NOTIFICATIONS_READ",
          audience,
          recipientId,
        }),
      resetDemoData: () => dispatch({ type: "RESET_DEMO_DATA" }),
      simulateNewRequest: () => dispatch({ type: "SIMULATE_NEW_REQUEST" }),
      startSampleTrip: () => dispatch({ type: "START_SAMPLE_TRIP" }),
      completeSampleTrip: () => dispatch({ type: "COMPLETE_SAMPLE_TRIP" }),
    }),
    [],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return ctx;
}

export const useAppActions = (): AppActions => useAppState().actions;

export const useAppSelector = <T,>(selector: (state: AppState) => T): T => {
  const { state } = useAppState();
  return useMemo(() => selector(state), [state, selector]);
};
