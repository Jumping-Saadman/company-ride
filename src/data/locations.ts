import { Location, LocationType } from "../types";

/**
 * Every location the app knows about. The `pinned` ones are our own permanent
 * sites - headquarters, the corporate branch, our factories and the clients we
 * visit week in, week out. They are always rendered on every map (see
 * `LandmarkLayer`) so the fleet is read against a stable picture of our
 * footprint. Unpinned entries are one-off destinations: they exist as soon as a
 * trip is booked to them and only appear on maps that involve that trip.
 */
export const LOCATIONS: Location[] = [
  {
    id: "loc-hq",
    name: "NexaCore Headquarters",
    address: "Rampura, Dhaka 1219",
    lat: 23.758,
    lng: 90.4257,
    type: LocationType.HEADQUARTERS,
    pinned: true,
  },
  {
    id: "loc-branch",
    name: "Corporate Branch",
    address: "Banani, Dhaka 1213",
    lat: 23.7937,
    lng: 90.4066,
    type: LocationType.BRANCH,
    pinned: true,
  },
  {
    id: "loc-factory",
    name: "NexaCore Factory",
    address: "Tejgaon Industrial Area, Dhaka 1208",
    lat: 23.7686,
    lng: 90.3958,
    type: LocationType.FACTORY,
    pinned: true,
  },
  {
    id: "loc-factory-south",
    name: "NexaCore Assembly Plant",
    address: "Shyampur Industrial Area, Dhaka 1204",
    lat: 23.6928,
    lng: 90.4342,
    type: LocationType.FACTORY,
    pinned: true,
  },
  {
    id: "loc-client-a",
    name: "CA Bhaban (Client A)",
    address: "Karwan Bazar, Dhaka 1215",
    lat: 23.7517,
    lng: 90.3927,
    type: LocationType.CLIENT_OFFICE,
    pinned: true,
  },
  {
    id: "loc-client-b",
    name: "Client B Office",
    address: "Gulshan-2, Dhaka 1212",
    lat: 23.7925,
    lng: 90.4078,
    type: LocationType.CLIENT_OFFICE,
    pinned: true,
  },
  {
    id: "loc-client-c",
    name: "Client C Tower",
    address: "Dilkusha C/A, Motijheel, Dhaka 1000",
    lat: 23.733,
    lng: 90.4172,
    type: LocationType.CLIENT_OFFICE,
    pinned: true,
  },
  {
    id: "loc-airport",
    name: "Hazrat Shahjalal International Airport",
    address: "Kurmitola, Dhaka 1229",
    lat: 23.8433,
    lng: 90.3978,
    type: LocationType.AIRPORT,
    pinned: true,
  },
];

/** Our permanent sites, in the order they should be listed and drawn. */
export const PINNED_LOCATIONS: Location[] = LOCATIONS.filter((l) => l.pinned);

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
