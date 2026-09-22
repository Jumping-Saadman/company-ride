import { Location, LocationType } from "../types";

export const LOCATIONS: Location[] = [
  {
    id: "loc-hq",
    name: "NexaCore Headquarters",
    address: "Rampura, Dhaka 1219",
    lat: 23.758,
    lng: 90.4257,
    type: LocationType.HEADQUARTERS,
  },
  {
    id: "loc-factory",
    name: "NexaCore Factory",
    address: "Tejgaon Industrial Area, Dhaka 1208",
    lat: 23.7686,
    lng: 90.3958,
    type: LocationType.FACTORY,
  },
  {
    id: "loc-client-a",
    name: "CA Bhaban (Client A)",
    address: "Karwan Bazar, Dhaka 1215",
    lat: 23.7517,
    lng: 90.3927,
    type: LocationType.CLIENT_OFFICE,
  },
  {
    id: "loc-client-b",
    name: "Client B Office",
    address: "Gulshan-2, Dhaka 1212",
    lat: 23.7925,
    lng: 90.4078,
    type: LocationType.CLIENT_OFFICE,
  },
  {
    id: "loc-branch",
    name: "Corporate Branch",
    address: "Banani, Dhaka 1213",
    lat: 23.7937,
    lng: 90.4066,
    type: LocationType.BRANCH,
  },
  {
    id: "loc-airport",
    name: "Hazrat Shahjalal International Airport",
    address: "Kurmitola, Dhaka 1229",
    lat: 23.8433,
    lng: 90.3978,
    type: LocationType.AIRPORT,
  },
];

export const getLocationById = (id: string): Location | undefined =>
  LOCATIONS.find((l) => l.id === id);

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  headquarters: "Headquarters",
  factory: "Factory",
  client_office: "Client Office",
  branch: "Corporate Branch",
  airport: "Airport",
  other: "Other",
};
