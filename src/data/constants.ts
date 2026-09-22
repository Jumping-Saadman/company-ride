import {
  DriverStatus,
  EmployeeStatus,
  RideRequestStatus,
  TripStatus,
} from "../types";

export const AVERAGE_SPEED_KMH = 26;

export const MIN_LEAD_DAYS_FOR_REQUEST = 1;

export const COMPANY_NAME = "NexaCore Industries";

export interface StatusMeta {
  label: string;
  textClass: string;
  bgClass: string;
  dotClass: string;
}

export const RIDE_REQUEST_STATUS_META: Record<RideRequestStatus, StatusMeta> = {
  [RideRequestStatus.PENDING]: {
    label: "Pending",
    textClass: "text-amber-700",
    bgClass: "bg-amber-100",
    dotClass: "bg-amber-500",
  },
  [RideRequestStatus.APPROVED]: {
    label: "Approved",
    textClass: "text-blue-700",
    bgClass: "bg-blue-100",
    dotClass: "bg-blue-500",
  },
  [RideRequestStatus.ASSIGNED]: {
    label: "Assigned",
    textClass: "text-blue-700",
    bgClass: "bg-blue-100",
    dotClass: "bg-blue-500",
  },
  [RideRequestStatus.REJECTED]: {
    label: "Rejected",
    textClass: "text-red-700",
    bgClass: "bg-red-100",
    dotClass: "bg-red-500",
  },
  [RideRequestStatus.CANCELLED]: {
    label: "Cancelled",
    textClass: "text-red-700",
    bgClass: "bg-red-100",
    dotClass: "bg-red-500",
  },
};

export const TRIP_STATUS_META: Record<TripStatus, StatusMeta> = {
  [TripStatus.SCHEDULED]: {
    label: "Scheduled",
    textClass: "text-blue-700",
    bgClass: "bg-blue-100",
    dotClass: "bg-blue-500",
  },
  [TripStatus.DRIVER_EN_ROUTE]: {
    label: "Driver En Route",
    textClass: "text-violet-700",
    bgClass: "bg-violet-100",
    dotClass: "bg-violet-500",
  },
  [TripStatus.ARRIVED_AT_PICKUP]: {
    label: "Arrived at Pickup",
    textClass: "text-violet-700",
    bgClass: "bg-violet-100",
    dotClass: "bg-violet-500",
  },
  [TripStatus.PASSENGER_PICKED_UP]: {
    label: "Passenger Picked Up",
    textClass: "text-violet-700",
    bgClass: "bg-violet-100",
    dotClass: "bg-violet-500",
  },
  [TripStatus.IN_PROGRESS]: {
    label: "In Progress",
    textClass: "text-violet-700",
    bgClass: "bg-violet-100",
    dotClass: "bg-violet-500",
  },
  [TripStatus.COMPLETED]: {
    label: "Completed",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
  [TripStatus.CANCELLED]: {
    label: "Cancelled",
    textClass: "text-red-700",
    bgClass: "bg-red-100",
    dotClass: "bg-red-500",
  },
};

export const DRIVER_STATUS_META: Record<DriverStatus, StatusMeta> = {
  [DriverStatus.AVAILABLE]: {
    label: "Available",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
  [DriverStatus.ON_TRIP]: {
    label: "On Trip",
    textClass: "text-violet-700",
    bgClass: "bg-violet-100",
    dotClass: "bg-violet-500",
  },
  [DriverStatus.OFFLINE]: {
    label: "Offline",
    textClass: "text-slate-600",
    bgClass: "bg-slate-100",
    dotClass: "bg-slate-400",
  },
};

export const EMPLOYEE_STATUS_META: Record<EmployeeStatus, StatusMeta> = {
  [EmployeeStatus.ACTIVE]: {
    label: "Active",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
  [EmployeeStatus.INACTIVE]: {
    label: "Inactive",
    textClass: "text-slate-600",
    bgClass: "bg-slate-100",
    dotClass: "bg-slate-400",
  },
};

// Ordered list of active (non-terminal) trip statuses driving the driver workflow.
export const TRIP_STATUS_FLOW: TripStatus[] = [
  TripStatus.SCHEDULED,
  TripStatus.DRIVER_EN_ROUTE,
  TripStatus.ARRIVED_AT_PICKUP,
  TripStatus.PASSENGER_PICKED_UP,
  TripStatus.IN_PROGRESS,
  TripStatus.COMPLETED,
];

export function isActiveTripStatus(status: TripStatus): boolean {
  return (
    status !== TripStatus.SCHEDULED &&
    status !== TripStatus.COMPLETED &&
    status !== TripStatus.CANCELLED
  );
}

export function nextTripStatus(status: TripStatus): TripStatus | null {
  const idx = TRIP_STATUS_FLOW.indexOf(status);
  if (idx === -1 || idx === TRIP_STATUS_FLOW.length - 1) return null;
  return TRIP_STATUS_FLOW[idx + 1];
}

export const TRIP_STATUS_ACTION_LABEL: Partial<Record<TripStatus, string>> = {
  [TripStatus.SCHEDULED]: "Start / Driver En Route",
  [TripStatus.DRIVER_EN_ROUTE]: "Arrived at Pickup",
  [TripStatus.ARRIVED_AT_PICKUP]: "Passenger Picked Up",
  [TripStatus.PASSENGER_PICKED_UP]: "Start Journey",
  [TripStatus.IN_PROGRESS]: "Complete Trip",
};
