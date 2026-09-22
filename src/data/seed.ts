import {
  NotificationAudience,
  RideRequestStatus,
  TripStatus,
} from "../types";
import type { AppNotification, RideRequest, Trip, TripTimelineEvent } from "../types";
import { addDaysISO, isoTimestamp, todayISODate } from "../lib/date";
import { getRouteBetween } from "./routes";
import { getLocationById } from "./locations";
import { getSnapshotAtProgress } from "../lib/simulation";

const today = todayISODate();

// ---------- Pending ride requests ----------

export const SEED_RIDE_REQUESTS: RideRequest[] = [
  {
    id: "TR-2026-0041",
    employeeId: "emp-nadia",
    travelDate: addDaysISO(today, 2),
    departureTime: "09:30",
    pickupLocationId: "loc-hq",
    destinationLocationId: "loc-client-b",
    purpose: "Client review meeting",
    passengerCount: 1,
    notes: "Please arrange a sedan if possible.",
    status: RideRequestStatus.PENDING,
    createdAt: isoTimestamp(today, "08:12"),
  },
  {
    id: "TR-2026-0042",
    employeeId: "emp-mehedi",
    travelDate: addDaysISO(today, 1),
    departureTime: "14:00",
    pickupLocationId: "loc-hq",
    destinationLocationId: "loc-client-a",
    purpose: "Sales presentation to prospective client",
    passengerCount: 2,
    status: RideRequestStatus.PENDING,
    createdAt: isoTimestamp(today, "09:47"),
  },
  {
    id: "TR-2026-0043",
    employeeId: "emp-sadia",
    travelDate: addDaysISO(today, 3),
    departureTime: "11:00",
    pickupLocationId: "loc-branch",
    destinationLocationId: "loc-airport",
    purpose: "Recruitment drive travel",
    passengerCount: 1,
    notes: "Flight departs 13:40, please plan buffer time.",
    status: RideRequestStatus.PENDING,
    createdAt: isoTimestamp(today, "10:05"),
  },
  {
    id: "TR-2026-0044",
    employeeId: "emp-farhana",
    travelDate: addDaysISO(today, 2),
    departureTime: "16:00",
    pickupLocationId: "loc-hq",
    destinationLocationId: "loc-factory",
    purpose: "Marketing photo shoot at factory floor",
    passengerCount: 3,
    status: RideRequestStatus.PENDING,
    createdAt: isoTimestamp(today, "11:30"),
  },
  {
    id: "TR-2026-0038",
    employeeId: "emp-tanvir",
    travelDate: addDaysISO(today, 1),
    departureTime: "10:00",
    pickupLocationId: "loc-hq",
    destinationLocationId: "loc-client-a",
    purpose: "Operations audit walkthrough",
    passengerCount: 1,
    status: RideRequestStatus.ASSIGNED,
    createdAt: isoTimestamp(addDaysISO(today, -1), "15:20"),
  },
  {
    id: "TR-2026-0039",
    employeeId: "emp-imran",
    travelDate: addDaysISO(today, 1),
    departureTime: "15:30",
    pickupLocationId: "loc-hq",
    destinationLocationId: "loc-client-b",
    purpose: "Quarterly finance review with client",
    passengerCount: 1,
    status: RideRequestStatus.ASSIGNED,
    createdAt: isoTimestamp(addDaysISO(today, -1), "16:02"),
  },
  {
    id: "TR-2026-0040",
    employeeId: "emp-arif",
    travelDate: addDaysISO(today, 2),
    departureTime: "06:00",
    pickupLocationId: "loc-branch",
    destinationLocationId: "loc-airport",
    purpose: "Regional conference travel",
    passengerCount: 1,
    notes: "Early morning flight, driver should arrive 15 min early.",
    status: RideRequestStatus.ASSIGNED,
    createdAt: isoTimestamp(addDaysISO(today, -1), "17:40"),
  },
  {
    id: "TR-2026-0036",
    employeeId: "emp-nadia",
    travelDate: addDaysISO(today, 3),
    departureTime: "09:00",
    pickupLocationId: "loc-hq",
    destinationLocationId: "loc-factory",
    purpose: "Technology rollout coordination meeting",
    passengerCount: 1,
    status: RideRequestStatus.ASSIGNED,
    createdAt: isoTimestamp(addDaysISO(today, -2), "13:10"),
  },
  {
    id: "TR-2026-0037",
    employeeId: "emp-mehedi",
    travelDate: addDaysISO(today, 3),
    departureTime: "13:00",
    pickupLocationId: "loc-hq",
    destinationLocationId: "loc-client-b",
    purpose: "Contract negotiation follow-up",
    passengerCount: 1,
    status: RideRequestStatus.ASSIGNED,
    createdAt: isoTimestamp(addDaysISO(today, -2), "14:25"),
  },
  {
    id: "TR-2026-0033",
    employeeId: "emp-rasel",
    travelDate: addDaysISO(today, -1),
    departureTime: "09:00",
    pickupLocationId: "loc-hq",
    destinationLocationId: "loc-client-a",
    purpose: "Supplier negotiation meeting",
    passengerCount: 1,
    status: RideRequestStatus.REJECTED,
    createdAt: isoTimestamp(addDaysISO(today, -3), "09:00"),
  },
];

// ---------- Upcoming (scheduled, not yet started) trips ----------

function buildScheduledTrip(params: {
  id: string;
  requestId: string;
  employeeId: string;
  driverId: string;
  from: string;
  to: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedAt: string;
}): Trip {
  const route = getRouteBetween(params.from, params.to)!;
  const pickup = getLocationById(params.from)!;

  return {
    id: params.id,
    requestId: params.requestId,
    employeeId: params.employeeId,
    driverId: params.driverId,
    pickupLocationId: params.from,
    destinationLocationId: params.to,
    routeId: route.id,
    scheduledDate: params.scheduledDate,
    scheduledTime: params.scheduledTime,
    status: TripStatus.SCHEDULED,
    progress: 0,
    distanceRemainingKm: route.distanceKm,
    etaMinutes: route.durationMinutes,
    currentPosition: { lat: pickup.lat, lng: pickup.lng },
    timeline: [
      { status: "assigned", label: "Trip Assigned", timestamp: params.assignedAt },
    ],
    createdAt: params.assignedAt,
    totalDistanceKm: route.distanceKm,
  };
}

export const SEED_UPCOMING_TRIPS: Trip[] = [
  buildScheduledTrip({
    id: "TRIP-1001",
    requestId: "TR-2026-0038",
    employeeId: "emp-tanvir",
    driverId: "drv-sabbir",
    from: "loc-hq",
    to: "loc-client-a",
    scheduledDate: addDaysISO(today, 1),
    scheduledTime: "10:00",
    assignedAt: isoTimestamp(addDaysISO(today, -1), "15:35"),
  }),
  buildScheduledTrip({
    id: "TRIP-1002",
    requestId: "TR-2026-0039",
    employeeId: "emp-imran",
    driverId: "drv-farid",
    from: "loc-hq",
    to: "loc-client-b",
    scheduledDate: addDaysISO(today, 1),
    scheduledTime: "15:30",
    assignedAt: isoTimestamp(addDaysISO(today, -1), "16:10"),
  }),
  buildScheduledTrip({
    id: "TRIP-1003",
    requestId: "TR-2026-0040",
    employeeId: "emp-arif",
    driverId: "drv-rahim",
    from: "loc-branch",
    to: "loc-airport",
    scheduledDate: addDaysISO(today, 2),
    scheduledTime: "06:00",
    assignedAt: isoTimestamp(addDaysISO(today, -1), "17:50"),
  }),
  buildScheduledTrip({
    id: "TRIP-1004",
    requestId: "TR-2026-0036",
    employeeId: "emp-nadia",
    driverId: "drv-sabbir",
    from: "loc-hq",
    to: "loc-factory",
    scheduledDate: addDaysISO(today, 3),
    scheduledTime: "09:00",
    assignedAt: isoTimestamp(addDaysISO(today, -2), "13:15"),
  }),
  buildScheduledTrip({
    id: "TRIP-1005",
    requestId: "TR-2026-0037",
    employeeId: "emp-mehedi",
    driverId: "drv-farid",
    from: "loc-hq",
    to: "loc-client-b",
    scheduledDate: addDaysISO(today, 3),
    scheduledTime: "13:00",
    assignedAt: isoTimestamp(addDaysISO(today, -2), "14:30"),
  }),
];

// ---------- Active trips (in progress right now) ----------

function buildActiveTrip(params: {
  id: string;
  employeeId: string;
  driverId: string;
  from: string;
  to: string;
  status: TripStatus;
  progressFraction: number;
  startTime: string;
}): Trip {
  const route = getRouteBetween(params.from, params.to)!;
  const snapshot = getSnapshotAtProgress(route, params.progressFraction);
  const startedAt = isoTimestamp(today, params.startTime);

  const timeline: TripTimelineEvent[] = [
    { status: "assigned" as const, label: "Trip Assigned", timestamp: startedAt },
    {
      status: TripStatus.DRIVER_EN_ROUTE,
      label: "Driver En Route",
      timestamp: startedAt,
    },
  ];
  if (params.status !== TripStatus.DRIVER_EN_ROUTE) {
    timeline.push({
      status: TripStatus.ARRIVED_AT_PICKUP,
      label: "Arrived at Pickup",
      timestamp: startedAt,
    });
    timeline.push({
      status: TripStatus.PASSENGER_PICKED_UP,
      label: "Passenger Picked Up",
      timestamp: startedAt,
    });
  }
  if (
    params.status === TripStatus.IN_PROGRESS ||
    params.status === TripStatus.COMPLETED
  ) {
    timeline.push({
      status: TripStatus.IN_PROGRESS,
      label: "Journey Started",
      timestamp: startedAt,
    });
  }

  return {
    id: params.id,
    requestId: `REQ-${params.id}`,
    employeeId: params.employeeId,
    driverId: params.driverId,
    pickupLocationId: params.from,
    destinationLocationId: params.to,
    routeId: route.id,
    scheduledDate: today,
    scheduledTime: params.startTime,
    status: params.status,
    progress: snapshot.progress,
    distanceRemainingKm: snapshot.distanceRemainingKm,
    etaMinutes: snapshot.etaMinutes,
    currentPosition: { lat: snapshot.lat, lng: snapshot.lng },
    timeline,
    createdAt: startedAt,
    totalDistanceKm: route.distanceKm,
  };
}

export const SEED_ACTIVE_TRIPS: Trip[] = [
  buildActiveTrip({
    id: "TRIP-2001",
    employeeId: "emp-imran",
    driverId: "drv-jamal",
    from: "loc-hq",
    to: "loc-factory",
    status: TripStatus.IN_PROGRESS,
    progressFraction: 0.55,
    startTime: "08:30",
  }),
  buildActiveTrip({
    id: "TRIP-2002",
    employeeId: "emp-sadia",
    driverId: "drv-sabbir",
    from: "loc-hq",
    to: "loc-client-a",
    status: TripStatus.PASSENGER_PICKED_UP,
    progressFraction: 0.15,
    startTime: "09:00",
  }),
  buildActiveTrip({
    id: "TRIP-2003",
    employeeId: "emp-farhana",
    driverId: "drv-farid",
    from: "loc-hq",
    to: "loc-client-b",
    status: TripStatus.DRIVER_EN_ROUTE,
    progressFraction: 0,
    startTime: "09:15",
  }),
];

// ---------- Historical completed trips ----------

const HISTORY_SEEDS: {
  employeeId: string;
  driverId: string;
  from: string;
  to: string;
  daysAgo: number;
  time: string;
}[] = [
  { employeeId: "emp-arif", driverId: "drv-rahim", from: "loc-hq", to: "loc-factory", daysAgo: 2, time: "09:00" },
  { employeeId: "emp-nadia", driverId: "drv-karim", from: "loc-hq", to: "loc-client-a", daysAgo: 3, time: "10:30" },
  { employeeId: "emp-tanvir", driverId: "drv-jamal", from: "loc-hq", to: "loc-client-b", daysAgo: 3, time: "14:00" },
  { employeeId: "emp-mehedi", driverId: "drv-sabbir", from: "loc-branch", to: "loc-airport", daysAgo: 4, time: "06:30" },
  { employeeId: "emp-sadia", driverId: "drv-farid", from: "loc-hq", to: "loc-factory", daysAgo: 5, time: "11:00" },
  { employeeId: "emp-imran", driverId: "drv-rahim", from: "loc-hq", to: "loc-client-b", daysAgo: 6, time: "13:15" },
  { employeeId: "emp-farhana", driverId: "drv-karim", from: "loc-hq", to: "loc-client-a", daysAgo: 7, time: "09:45" },
  { employeeId: "emp-arif", driverId: "drv-jamal", from: "loc-branch", to: "loc-airport", daysAgo: 8, time: "05:45" },
  { employeeId: "emp-nadia", driverId: "drv-sabbir", from: "loc-hq", to: "loc-client-b", daysAgo: 10, time: "15:00" },
  { employeeId: "emp-tanvir", driverId: "drv-farid", from: "loc-hq", to: "loc-factory", daysAgo: 12, time: "08:15" },
  { employeeId: "emp-mehedi", driverId: "drv-rahim", from: "loc-hq", to: "loc-client-a", daysAgo: 14, time: "10:00" },
  { employeeId: "emp-sadia", driverId: "drv-karim", from: "loc-hq", to: "loc-client-b", daysAgo: 16, time: "12:30" },
];

function buildHistoricalTrip(
  seed: (typeof HISTORY_SEEDS)[number],
  index: number,
): Trip {
  const route = getRouteBetween(seed.from, seed.to)!;
  const date = addDaysISO(today, -seed.daysAgo);
  const createdAt = isoTimestamp(date, seed.time);
  const durationMinutes = route.durationMinutes + (index % 3) * 3;
  const completedAt = new Date(
    new Date(createdAt).getTime() + durationMinutes * 60000,
  ).toISOString();

  return {
    id: `TRIP-${3000 + index}`,
    requestId: `REQ-HIST-${3000 + index}`,
    employeeId: seed.employeeId,
    driverId: seed.driverId,
    pickupLocationId: seed.from,
    destinationLocationId: seed.to,
    routeId: route.id,
    scheduledDate: date,
    scheduledTime: seed.time,
    status: TripStatus.COMPLETED,
    progress: 100,
    distanceRemainingKm: 0,
    etaMinutes: 0,
    currentPosition: {
      lat: route.coordinates[route.coordinates.length - 1][1],
      lng: route.coordinates[route.coordinates.length - 1][0],
    },
    timeline: [
      { status: "assigned", label: "Trip Assigned", timestamp: createdAt },
      { status: TripStatus.DRIVER_EN_ROUTE, label: "Driver En Route", timestamp: createdAt },
      { status: TripStatus.ARRIVED_AT_PICKUP, label: "Arrived at Pickup", timestamp: createdAt },
      { status: TripStatus.PASSENGER_PICKED_UP, label: "Passenger Picked Up", timestamp: createdAt },
      { status: TripStatus.IN_PROGRESS, label: "Journey Started", timestamp: createdAt },
      { status: TripStatus.COMPLETED, label: "Trip Completed", timestamp: completedAt },
    ],
    createdAt,
    completedAt,
    totalDistanceKm: route.distanceKm,
    durationMinutes,
  };
}

export const SEED_HISTORICAL_TRIPS: Trip[] = HISTORY_SEEDS.map(
  buildHistoricalTrip,
);

export const SEED_TRIPS: Trip[] = [
  ...SEED_ACTIVE_TRIPS,
  ...SEED_UPCOMING_TRIPS,
  ...SEED_HISTORICAL_TRIPS,
];

// ---------- Notifications ----------

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    audience: NotificationAudience.ADMIN,
    title: "New ride request",
    message: "Nadia Islam submitted a new ride request for Gulshan-2.",
    createdAt: isoTimestamp(today, "08:12"),
    read: false,
    relatedRequestId: "TR-2026-0041",
  },
  {
    id: "notif-2",
    audience: NotificationAudience.ADMIN,
    title: "New ride request",
    message: "Mehedi Hasan submitted a new ride request for CA Bhaban.",
    createdAt: isoTimestamp(today, "09:47"),
    read: false,
    relatedRequestId: "TR-2026-0042",
  },
  {
    id: "notif-3",
    audience: NotificationAudience.ADMIN,
    title: "New ride request",
    message: "Sadia Karim submitted a new ride request for the airport.",
    createdAt: isoTimestamp(today, "10:05"),
    read: true,
    relatedRequestId: "TR-2026-0043",
  },
  {
    id: "notif-4",
    audience: NotificationAudience.DRIVER,
    recipientId: "drv-sabbir",
    title: "Trip assigned",
    message: "New trip assigned for 10:00 AM tomorrow to CA Bhaban.",
    createdAt: isoTimestamp(addDaysISO(today, -1), "15:35"),
    read: true,
    relatedTripId: "TRIP-1001",
  },
  {
    id: "notif-5",
    audience: NotificationAudience.EMPLOYEE,
    recipientId: "emp-tanvir",
    title: "Ride assigned",
    message: "Your ride has been assigned to Sabbir Khan (Toyota Corolla).",
    createdAt: isoTimestamp(addDaysISO(today, -1), "15:36"),
    read: true,
    relatedTripId: "TRIP-1001",
  },
  {
    id: "notif-6",
    audience: NotificationAudience.EMPLOYEE,
    recipientId: "emp-imran",
    title: "Driver approaching",
    message: "Your driver is approximately 5 minutes away.",
    createdAt: isoTimestamp(today, "08:20"),
    read: false,
    relatedTripId: "TRIP-2001",
  },
  {
    id: "notif-7",
    audience: NotificationAudience.DRIVER,
    recipientId: "drv-farid",
    title: "Trip assigned",
    message: "New trip assigned for 09:15 AM today to Gulshan-2.",
    createdAt: isoTimestamp(today, "09:00"),
    read: false,
    relatedTripId: "TRIP-2003",
  },
  {
    id: "notif-8",
    audience: NotificationAudience.ADMIN,
    title: "Trip completed",
    message: "Trip to CA Bhaban completed by Rahim Uddin.",
    createdAt: isoTimestamp(addDaysISO(today, -2), "10:55"),
    read: true,
    relatedTripId: "TRIP-3001",
  },
];
