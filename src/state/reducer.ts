import {
  DriverStatus,
  NotificationAudience,
  RideRequestStatus,
  TripStatus,
} from "../types";
import type {
  AppNotification,
  DemoUser,
  SimulationSpeed,
  Trip,
} from "../types";
import type { AppState, NewRideRequestInput } from "./types";
import { createSeedState } from "./seedState";
import { getEmployeeById } from "../data/employees";
import { getDriverById } from "../data/drivers";
import { getLocationById } from "../data/locations";
import { getRouteBetween } from "../data/routes";
import { isActiveTripStatus, nextTripStatus } from "../data/constants";
import { generateNextRequestId } from "../lib/idGen";

let idCounter = Date.now();
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function nextRequestNumber(state: AppState): string {
  return generateNextRequestId(state.rideRequests.map((r) => r.id));
}

function nextTripId(state: AppState): string {
  const max = state.trips.reduce((acc, t) => {
    const match = t.id.match(/TRIP-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `TRIP-${max + 1}`;
}

function pushNotification(
  notif: Omit<AppNotification, "id" | "createdAt" | "read">,
): AppNotification {
  return {
    ...notif,
    id: nextId("notif"),
    createdAt: new Date().toISOString(),
    read: false,
  };
}

export type Action =
  | { type: "SWITCH_USER"; user: DemoUser }
  | { type: "SUBMIT_RIDE_REQUEST"; input: NewRideRequestInput }
  | { type: "APPROVE_REQUEST"; requestId: string }
  | { type: "REJECT_REQUEST"; requestId: string }
  | { type: "CANCEL_REQUEST"; requestId: string }
  | { type: "ASSIGN_DRIVER"; requestId: string; driverId: string }
  | { type: "ADVANCE_TRIP_STATUS"; tripId: string }
  | { type: "CANCEL_TRIP"; tripId: string }
  | { type: "SET_DRIVER_STATUS"; driverId: string; status: DriverStatus }
  | {
      type: "UPDATE_TRIP_POSITION";
      tripId: string;
      lat: number;
      lng: number;
      progress: number;
      distanceRemainingKm: number;
      etaMinutes: number;
    }
  | {
      type: "SET_PLAYBACK";
      tripId: string;
      isPlaying?: boolean;
      speed?: SimulationSpeed;
    }
  | { type: "RESET_PLAYBACK"; tripId: string }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ"; audience: NotificationAudience; recipientId?: string }
  | { type: "RESET_DEMO_DATA" }
  | { type: "SIMULATE_NEW_REQUEST" }
  | { type: "START_SAMPLE_TRIP" }
  | { type: "COMPLETE_SAMPLE_TRIP" };

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SWITCH_USER":
      return { ...state, currentUser: action.user };

    case "SUBMIT_RIDE_REQUEST": {
      const id = nextRequestNumber(state);
      const request = {
        id,
        ...action.input,
        status: RideRequestStatus.PENDING,
        createdAt: new Date().toISOString(),
      };
      const employee = getEmployeeById(action.input.employeeId);
      const notif = pushNotification({
        audience: NotificationAudience.ADMIN,
        title: "New ride request",
        message: `${employee?.name ?? "An employee"} submitted a new ride request.`,
        relatedRequestId: id,
      });
      return {
        ...state,
        rideRequests: [request, ...state.rideRequests],
        notifications: [notif, ...state.notifications],
      };
    }

    case "APPROVE_REQUEST": {
      return {
        ...state,
        rideRequests: state.rideRequests.map((r) =>
          r.id === action.requestId
            ? { ...r, status: RideRequestStatus.APPROVED }
            : r,
        ),
      };
    }

    case "REJECT_REQUEST": {
      const request = state.rideRequests.find((r) => r.id === action.requestId);
      const notif = request
        ? pushNotification({
            audience: NotificationAudience.EMPLOYEE,
            recipientId: request.employeeId,
            title: "Ride request rejected",
            message: "Your ride request was not approved by the transport administrator.",
            relatedRequestId: request.id,
          })
        : null;
      return {
        ...state,
        rideRequests: state.rideRequests.map((r) =>
          r.id === action.requestId
            ? { ...r, status: RideRequestStatus.REJECTED }
            : r,
        ),
        notifications: notif ? [notif, ...state.notifications] : state.notifications,
      };
    }

    case "CANCEL_REQUEST": {
      return {
        ...state,
        rideRequests: state.rideRequests.map((r) =>
          r.id === action.requestId
            ? { ...r, status: RideRequestStatus.CANCELLED }
            : r,
        ),
      };
    }

    case "ASSIGN_DRIVER": {
      const request = state.rideRequests.find((r) => r.id === action.requestId);
      const driver = getDriverById(action.driverId);
      if (!request || !driver) return state;

      const route = getRouteBetween(
        request.pickupLocationId,
        request.destinationLocationId,
      );
      const pickup = getLocationById(request.pickupLocationId);

      const trip: Trip = {
        id: nextTripId(state),
        requestId: request.id,
        employeeId: request.employeeId,
        driverId: driver.id,
        pickupLocationId: request.pickupLocationId,
        destinationLocationId: request.destinationLocationId,
        routeId: route?.id ?? "",
        scheduledDate: request.travelDate,
        scheduledTime: request.departureTime,
        status: TripStatus.SCHEDULED,
        progress: 0,
        distanceRemainingKm: route?.distanceKm ?? 0,
        etaMinutes: route?.durationMinutes ?? 0,
        currentPosition: pickup
          ? { lat: pickup.lat, lng: pickup.lng }
          : { lat: 0, lng: 0 },
        timeline: [
          {
            status: "assigned",
            label: "Trip Assigned",
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        totalDistanceKm: route?.distanceKm ?? 0,
      };

      const employee = getEmployeeById(request.employeeId);
      const driverNotif = pushNotification({
        audience: NotificationAudience.DRIVER,
        recipientId: driver.id,
        title: "New trip assigned",
        message: `New trip assigned for ${request.departureTime} on ${request.travelDate}.`,
        relatedTripId: trip.id,
      });
      const employeeNotif = pushNotification({
        audience: NotificationAudience.EMPLOYEE,
        recipientId: employee?.id,
        title: "Ride assigned",
        message: `Your ride has been assigned to ${driver.name} (${driver.vehicle.model}).`,
        relatedTripId: trip.id,
      });

      return {
        ...state,
        rideRequests: state.rideRequests.map((r) =>
          r.id === action.requestId
            ? { ...r, status: RideRequestStatus.ASSIGNED }
            : r,
        ),
        trips: [trip, ...state.trips],
        notifications: [driverNotif, employeeNotif, ...state.notifications],
      };
    }

    case "ADVANCE_TRIP_STATUS": {
      const trip = state.trips.find((t) => t.id === action.tripId);
      if (!trip) return state;
      const next = nextTripStatus(trip.status);
      if (!next) return state;

      const timestamp = new Date().toISOString();
      const labelMap: Record<string, string> = {
        [TripStatus.DRIVER_EN_ROUTE]: "Driver En Route",
        [TripStatus.ARRIVED_AT_PICKUP]: "Arrived at Pickup",
        [TripStatus.PASSENGER_PICKED_UP]: "Passenger Picked Up",
        [TripStatus.IN_PROGRESS]: "Journey Started",
        [TripStatus.COMPLETED]: "Trip Completed",
      };

      const isCompleting = next === TripStatus.COMPLETED;
      const wasActive = isActiveTripStatus(trip.status);
      const becomingActive = !wasActive && isActiveTripStatus(next);

      const updatedTrip: Trip = {
        ...trip,
        status: next,
        timeline: [
          ...trip.timeline,
          { status: next, label: labelMap[next] ?? next, timestamp },
        ],
        ...(isCompleting
          ? {
              progress: 100,
              distanceRemainingKm: 0,
              etaMinutes: 0,
              completedAt: timestamp,
              durationMinutes: Math.round(
                (new Date(timestamp).getTime() -
                  new Date(trip.createdAt).getTime()) /
                  60000,
              ),
            }
          : {}),
      };

      const driver = getDriverById(trip.driverId);
      const employee = getEmployeeById(trip.employeeId);
      const notifications: AppNotification[] = [];

      if (isCompleting) {
        notifications.push(
          pushNotification({
            audience: NotificationAudience.ADMIN,
            title: "Trip completed",
            message: `Trip to ${getLocationById(trip.destinationLocationId)?.name ?? "destination"} completed by ${driver?.name ?? "driver"}.`,
            relatedTripId: trip.id,
          }),
        );
      } else if (next === TripStatus.DRIVER_EN_ROUTE) {
        notifications.push(
          pushNotification({
            audience: NotificationAudience.EMPLOYEE,
            recipientId: employee?.id,
            title: "Driver en route",
            message: `${driver?.name ?? "Your driver"} is on the way to your pickup location.`,
            relatedTripId: trip.id,
          }),
        );
      } else if (next === TripStatus.PASSENGER_PICKED_UP) {
        notifications.push(
          pushNotification({
            audience: NotificationAudience.ADMIN,
            title: "Passenger picked up",
            message: `${driver?.name ?? "Driver"} picked up ${employee?.name ?? "passenger"}.`,
            relatedTripId: trip.id,
          }),
        );
      }

      const drivers = state.drivers.map((d) => {
        if (d.id !== trip.driverId) return d;
        if (isCompleting) return { ...d, status: DriverStatus.AVAILABLE };
        if (becomingActive) return { ...d, status: DriverStatus.ON_TRIP };
        return d;
      });

      return {
        ...state,
        trips: state.trips.map((t) => (t.id === trip.id ? updatedTrip : t)),
        drivers,
        notifications: [...notifications, ...state.notifications],
        playback: isCompleting
          ? Object.fromEntries(
              Object.entries(state.playback).filter(([id]) => id !== trip.id),
            )
          : state.playback,
      };
    }

    case "CANCEL_TRIP": {
      const trip = state.trips.find((t) => t.id === action.tripId);
      if (!trip) return state;
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === trip.id ? { ...t, status: TripStatus.CANCELLED } : t,
        ),
        drivers: state.drivers.map((d) =>
          d.id === trip.driverId ? { ...d, status: DriverStatus.AVAILABLE } : d,
        ),
      };
    }

    case "SET_DRIVER_STATUS": {
      return {
        ...state,
        drivers: state.drivers.map((d) =>
          d.id === action.driverId ? { ...d, status: action.status } : d,
        ),
      };
    }

    case "UPDATE_TRIP_POSITION": {
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.tripId
            ? {
                ...t,
                currentPosition: { lat: action.lat, lng: action.lng },
                progress: action.progress,
                distanceRemainingKm: action.distanceRemainingKm,
                etaMinutes: action.etaMinutes,
              }
            : t,
        ),
      };
    }

    case "SET_PLAYBACK": {
      const current = state.playback[action.tripId] ?? {
        isPlaying: false,
        speed: 1 as SimulationSpeed,
      };
      return {
        ...state,
        playback: {
          ...state.playback,
          [action.tripId]: {
            isPlaying: action.isPlaying ?? current.isPlaying,
            speed: action.speed ?? current.speed,
          },
        },
      };
    }

    case "RESET_PLAYBACK": {
      const trip = state.trips.find((t) => t.id === action.tripId);
      if (!trip) return state;
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === trip.id
            ? {
                ...t,
                progress: 0,
                distanceRemainingKm: t.totalDistanceKm,
                etaMinutes: Math.round((t.totalDistanceKm / 26) * 60),
              }
            : t,
        ),
        playback: {
          ...state.playback,
          [action.tripId]: { isPlaying: false, speed: 1 },
        },
      };
    }

    case "MARK_NOTIFICATION_READ": {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n,
        ),
      };
    }

    case "MARK_ALL_NOTIFICATIONS_READ": {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.audience === action.audience &&
          (!action.recipientId || n.recipientId === action.recipientId)
            ? { ...n, read: true }
            : n,
        ),
      };
    }

    case "RESET_DEMO_DATA": {
      return createSeedState();
    }

    case "SIMULATE_NEW_REQUEST": {
      const pool = ["emp-arif", "emp-nadia", "emp-tanvir", "emp-mehedi"];
      const employeeId = pool[Math.floor(Math.random() * pool.length)];
      const destinations = ["loc-client-a", "loc-client-b", "loc-factory"];
      const destinationLocationId =
        destinations[Math.floor(Math.random() * destinations.length)];
      const id = nextRequestNumber(state);
      const employee = getEmployeeById(employeeId);
      const request = {
        id,
        employeeId,
        travelDate: new Date(Date.now() + 86400000 * 2)
          .toISOString()
          .slice(0, 10),
        departureTime: "10:00",
        pickupLocationId: "loc-hq",
        destinationLocationId,
        purpose: "Business travel request (demo)",
        passengerCount: 1,
        status: RideRequestStatus.PENDING,
        createdAt: new Date().toISOString(),
      };
      const notif = pushNotification({
        audience: NotificationAudience.ADMIN,
        title: "New ride request",
        message: `${employee?.name ?? "An employee"} submitted a new ride request.`,
        relatedRequestId: id,
      });
      return {
        ...state,
        rideRequests: [request, ...state.rideRequests],
        notifications: [notif, ...state.notifications],
      };
    }

    case "START_SAMPLE_TRIP": {
      const availableDriver = state.drivers.find(
        (d) => d.status === DriverStatus.AVAILABLE,
      );
      const pendingRequest = state.rideRequests.find(
        (r) => r.status === RideRequestStatus.PENDING,
      );
      if (!availableDriver || !pendingRequest) return state;
      let next = appReducer(state, {
        type: "APPROVE_REQUEST",
        requestId: pendingRequest.id,
      });
      next = appReducer(next, {
        type: "ASSIGN_DRIVER",
        requestId: pendingRequest.id,
        driverId: availableDriver.id,
      });
      const newTrip = next.trips.find(
        (t) => t.requestId === pendingRequest.id,
      );
      if (newTrip) {
        next = appReducer(next, {
          type: "ADVANCE_TRIP_STATUS",
          tripId: newTrip.id,
        });
      }
      return next;
    }

    case "COMPLETE_SAMPLE_TRIP": {
      const activeTrip = state.trips.find((t) =>
        isActiveTripStatus(t.status),
      );
      if (!activeTrip) return state;
      let trip = activeTrip;
      let next = state;
      while (trip.status !== TripStatus.COMPLETED) {
        next = appReducer(next, {
          type: "ADVANCE_TRIP_STATUS",
          tripId: trip.id,
        });
        const updated = next.trips.find((t) => t.id === trip.id);
        if (!updated) break;
        trip = updated;
      }
      return next;
    }

    default:
      return state;
  }
}
