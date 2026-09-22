import { useEffect } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { MapView } from "./MapView";
import { RouteLayer } from "./RouteLayer";
import { VehicleMarker } from "./VehicleMarker";
import { DHAKA_CENTER } from "../../lib/mapStyle";
import type { RouteDefinition } from "../../types";

export interface FleetVehicle {
  tripId: string;
  label: string;
  color: string;
  position: { lat: number; lng: number };
  route: RouteDefinition;
  progress: number;
}

interface FleetMapProps {
  vehicles: FleetVehicle[];
  focusedTripId?: string | null;
  onSelectVehicle?: (tripId: string) => void;
  className?: string;
}

function FocusController({
  map,
  vehicle,
}: {
  map: MapLibreMap;
  vehicle: FleetVehicle | undefined;
}) {
  useEffect(() => {
    if (!vehicle) return;
    map.flyTo({
      center: [vehicle.position.lng, vehicle.position.lat],
      zoom: 14,
      duration: 800,
    });
  }, [map, vehicle?.tripId]);
  return null;
}

export function FleetMap({
  vehicles,
  focusedTripId,
  onSelectVehicle,
  className = "h-full w-full",
}: FleetMapProps) {
  const focused = vehicles.find((v) => v.tripId === focusedTripId);

  return (
    <MapView className={className} initialCenter={DHAKA_CENTER} initialZoom={12.2}>
      {(map) => (
        <>
          <FocusController map={map} vehicle={focused} />
          {vehicles.map((vehicle) => (
            <RouteLayer
              key={`route-${vehicle.tripId}`}
              map={map}
              id={`fleet-route-${vehicle.tripId}`}
              coordinates={vehicle.route.coordinates}
              progress={vehicle.progress}
              color={vehicle.color}
            />
          ))}
          {vehicles.map((vehicle) => (
            <VehicleMarker
              key={`vehicle-${vehicle.tripId}`}
              map={map}
              lat={vehicle.position.lat}
              lng={vehicle.position.lng}
              label={vehicle.label}
              color={vehicle.color}
              onClick={() => onSelectVehicle?.(vehicle.tripId)}
            />
          ))}
        </>
      )}
    </MapView>
  );
}
