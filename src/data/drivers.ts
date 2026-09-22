import { Driver, DriverStatus } from "../types";
import { LOCATIONS } from "./locations";

const hq = LOCATIONS.find((l) => l.id === "loc-hq")!;

export const DRIVERS: Driver[] = [
  {
    id: "drv-rahim",
    name: "Rahim Uddin",
    phone: "+880 1811-330501",
    vehicle: { model: "Toyota Axio", plate: "DHA-15-4821" },
    status: DriverStatus.AVAILABLE,
    avatarColor: "#2563eb",
    currentLocation: { lat: hq.lat, lng: hq.lng },
  },
  {
    id: "drv-karim",
    name: "Karim Ahmed",
    phone: "+880 1811-330502",
    vehicle: { model: "Toyota Premio", plate: "DHA-18-7314" },
    status: DriverStatus.AVAILABLE,
    avatarColor: "#059669",
    currentLocation: { lat: 23.7937, lng: 90.4066 },
  },
  {
    id: "drv-jamal",
    name: "Jamal Hossain",
    phone: "+880 1811-330503",
    vehicle: { model: "Toyota Noah", plate: "DHA-11-9284" },
    status: DriverStatus.ON_TRIP,
    avatarColor: "#d97706",
    currentLocation: { lat: 23.7649, lng: 90.4066 },
  },
  {
    id: "drv-sabbir",
    name: "Sabbir Khan",
    phone: "+880 1811-330504",
    vehicle: { model: "Toyota Corolla", plate: "DHA-22-6017" },
    status: DriverStatus.ON_TRIP,
    avatarColor: "#7c3aed",
    currentLocation: { lat: 23.7573, lng: 90.3971 },
  },
  {
    id: "drv-farid",
    name: "Farid Molla",
    phone: "+880 1811-330506",
    vehicle: { model: "Toyota Allion", plate: "DHA-05-1123" },
    status: DriverStatus.ON_TRIP,
    avatarColor: "#0891b2",
    currentLocation: { lat: 23.7698, lng: 90.4258 },
  },
  {
    id: "drv-mizan",
    name: "Mizanur Rahman",
    phone: "+880 1811-330505",
    vehicle: { model: "Honda CR-V", plate: "DHA-09-3352" },
    status: DriverStatus.OFFLINE,
    avatarColor: "#64748b",
    currentLocation: { lat: hq.lat, lng: hq.lng },
  },
];

export const getDriverById = (id: string): Driver | undefined =>
  DRIVERS.find((d) => d.id === id);
