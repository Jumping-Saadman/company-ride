// ---------- Core enums ----------

export type UserRole = "admin" | "employee" | "driver";

export const RideRequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ASSIGNED: "assigned",
  CANCELLED: "cancelled",
} as const;
export type RideRequestStatus =
  (typeof RideRequestStatus)[keyof typeof RideRequestStatus];

export const TripStatus = {
  SCHEDULED: "scheduled",
  DRIVER_EN_ROUTE: "driver_en_route",
  ARRIVED_AT_PICKUP: "arrived_at_pickup",
  PASSENGER_PICKED_UP: "passenger_picked_up",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;
export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];

export const DriverStatus = {
  AVAILABLE: "available",
  ON_TRIP: "on_trip",
  OFFLINE: "offline",
} as const;
export type DriverStatus = (typeof DriverStatus)[keyof typeof DriverStatus];

export const EmployeeStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;
export type EmployeeStatus =
  (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

export const LocationType = {
  HEADQUARTERS: "headquarters",
  FACTORY: "factory",
  CLIENT_OFFICE: "client_office",
  BRANCH: "branch",
  AIRPORT: "airport",
  OTHER: "other",
} as const;
export type LocationType = (typeof LocationType)[keyof typeof LocationType];

export const NotificationAudience = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  DRIVER: "driver",
} as const;
export type NotificationAudience =
  (typeof NotificationAudience)[keyof typeof NotificationAudience];

// ---------- Domain models ----------

export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: LocationType;
  /**
   * A permanent company site (HQ, corporate office, factory, regular client).
   * Pinned locations are drawn on every map regardless of which trip is being
   * viewed; unpinned ones are ad-hoc destinations that only show up when a
   * trip actually goes there.
   */
  pinned?: boolean;
}

export interface Vehicle {
  model: string;
  plate: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  avatarColor: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: Vehicle;
  status: DriverStatus;
  avatarColor: string;
  currentLocation: { lat: number; lng: number };
}

export interface RideRequest {
  id: string;
  employeeId: string;
  travelDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  pickupLocationId: string;
  destinationLocationId: string;
  purpose: string;
  passengerCount: number;
  notes?: string;
  status: RideRequestStatus;
  createdAt: string; // ISO timestamp
}

export interface TripTimelineEvent {
  status: TripStatus | "assigned";
  label: string;
  timestamp: string; // ISO timestamp
}

export interface Trip {
  id: string;
  requestId: string;
  employeeId: string;
  driverId: string;
  pickupLocationId: string;
  destinationLocationId: string;
  routeId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: TripStatus;
  progress: number; // 0-100
  distanceRemainingKm: number;
  etaMinutes: number;
  currentPosition: { lat: number; lng: number };
  timeline: TripTimelineEvent[];
  createdAt: string;
  completedAt?: string;
  totalDistanceKm: number;
  durationMinutes?: number;
}

export interface AppNotification {
  id: string;
  audience: NotificationAudience;
  recipientId?: string; // employeeId or driverId; undefined = broadcast to all of that audience (admin)
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  relatedTripId?: string;
  relatedRequestId?: string;
}

export interface RouteDefinition {
  id: string;
  name: string;
  fromLocationId: string;
  toLocationId: string;
  coordinates: [number, number][]; // [lng, lat][]
  distanceKm: number;
  durationMinutes: number;
}

export interface DemoUser {
  role: UserRole;
  employeeId?: string;
  driverId?: string;
}

export type SimulationSpeed = 1 | 2 | 4 | 8;
