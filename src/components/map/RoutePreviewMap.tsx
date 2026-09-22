import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import * as maplibregl from "maplibre-gl";
import { MapView } from "./MapView";
import { RouteLayer } from "./RouteLayer";
import { LocationMarker } from "./LocationMarker";
import { Location, RouteDefinition } from "../../types";

interface RoutePreviewMapProps {
  route?: RouteDefinition;
  pickup: Location;
  destination: Location;
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
    if (fitted.current || coordinates.length < 2) return;
    const bounds = coordinates.reduce(
      (b, coord) => b.extend(coord),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
    );
    map.fitBounds(bounds, { padding: 40, duration: 0 });
    fitted.current = true;
  }, [map, coordinates]);
  return null;
}

/**
 * A compact, mostly non-interactive map showing the planned route between a
 * pickup and destination - used anywhere we want to show "here's the route"
 * before a trip is actually underway (request review, request detail).
 */
export function RoutePreviewMap({
  route,
  pickup,
  destination,
  className = "h-48 w-full",
}: RoutePreviewMapProps) {
  const coordinates = route?.coordinates ?? [
    [pickup.lng, pickup.lat],
    [destination.lng, destination.lat],
  ];

  return (
    <MapView className={className} initialZoom={11}>
      {(map) => (
        <>
          <FitBounds map={map} coordinates={coordinates} />
          {route && <RouteLayer map={map} id={`preview-${route.id}`} coordinates={route.coordinates} />}
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
        </>
      )}
    </MapView>
  );
}
