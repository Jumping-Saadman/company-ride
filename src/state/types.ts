import {
  AppNotification,
  DemoUser,
  Driver,
  Employee,
  RideRequest,
  SimulationSpeed,
  Trip,
} from "../types";

export interface SimulationPlaybackState {
  isPlaying: boolean;
  speed: SimulationSpeed;
}

export interface AppState {
  currentUser: DemoUser;
  employees: Employee[];
  drivers: Driver[];
  rideRequests: RideRequest[];
  trips: Trip[];
  notifications: AppNotification[];
  playback: Record<string, SimulationPlaybackState>; // keyed by tripId
}

export interface NewRideRequestInput {
  employeeId: string;
  travelDate: string;
  departureTime: string;
  pickupLocationId: string;
  destinationLocationId: string;
  purpose: string;
  passengerCount: number;
  notes?: string;
}
