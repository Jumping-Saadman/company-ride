import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import * as maplibregl from "maplibre-gl";
import { MapView } from "./MapView";
import { RouteLayer } from "./RouteLayer";
import { LocationMarker } from "./LocationMarker";
import { VehicleMarker } from "./VehicleMarker";
import type { Location, RouteDefinition } from "../../types";

interface LiveTripMapProps {
  route: RouteDefinition;
  pickup: Location;
  destination: Location;
  vehiclePosition: { lat: number; lng: number };
  vehicleLabel: string;
  progress: number;
  className?: string;
}

function FitBounds({
  map,
  coordinates,
}: {
  map: MapLibreMap;
  coordinates: [number, number][];
}) {
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current) return;
    const bounds = coordinates.reduce(
      (b, coord) => b.extend(coord),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
    );
    map.fitBounds(bounds, { padding: 64, duration: 0 });
    fitted.current = true;
  }, [map, coordinates]);
  return null;
}

export function LiveTripMap({
  route,
  pickup,
  destination,
  vehiclePosition,
  vehicleLabel,
  progress,
  className = "h-full w-full",
}: LiveTripMapProps) {
  return (
    <MapView className={className}>
      {(map) => (
        <>
          <FitBounds map={map} coordinates={route.coordinates} />
          <RouteLayer
            map={map}
            id={route.id}
            coordinates={route.coordinates}
            progress={progress}
          />
          <LocationMarker
            map={map}
            lat={pickup.lat}
            lng={pickup.lng}
            label={pickup.name}
            sublabel="Pickup"
            variant="pickup"
          />
          <LocationMarker
            map={map}
            lat={destination.lat}
            lng={destination.lng}
            label={destination.name}
            sublabel="Destination"
            variant="destination"
          />
          <VehicleMarker
            map={map}
            lat={vehiclePosition.lat}
            lng={vehiclePosition.lng}
            label={vehicleLabel}
          />
        </>
      )}
    </MapView>
  );
}
