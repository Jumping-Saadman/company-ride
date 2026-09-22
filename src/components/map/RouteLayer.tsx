import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import { computeRouteMetrics, interpolateAlongRoute } from "../../lib/geo";

interface RouteLayerProps {
  map: MapLibreMap;
  id: string;
  coordinates: [number, number][];
  progress?: number; // 0-100, renders a muted "traveled" overlay
  color?: string;
}

function buildTraveledCoordinates(
  coordinates: [number, number][],
  progressFraction: number,
) {
  if (progressFraction <= 0) return [coordinates[0]];
  if (progressFraction >= 1) return coordinates;

  const { distanceKm, cumulativeKm } = computeRouteMetrics(coordinates);
  const targetKm = distanceKm * progressFraction;
  const result: [number, number][] = [coordinates[0]];

  for (let i = 1; i < coordinates.length; i++) {
    if (cumulativeKm[i] <= targetKm) {
      result.push(coordinates[i]);
    } else {
      const point = interpolateAlongRoute(
        coordinates,
        cumulativeKm,
        distanceKm,
        progressFraction,
      );
      result.push([point.lng, point.lat]);
      break;
    }
  }
  return result;
}

/**
 * Renders a route the way turn-by-turn navigation apps do: a soft white
 * casing beneath a solid, rounded directions line in the vehicle/brand
 * color for the road ahead, with the already-driven portion redrawn in a
 * muted neutral tone on top so progress reads at a glance.
 */
export function RouteLayer({
  map,
  id,
  coordinates,
  progress = 0,
  color = "#2563eb",
}: RouteLayerProps) {
  const casingSourceId = `${id}-casing`;
  const baseSourceId = `${id}-base`;
  const traveledSourceId = `${id}-traveled`;
  const setupRef = useRef(false);

  useEffect(() => {
    if (map.getSource(baseSourceId)) return;

    const routeGeometry = {
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates },
    };

    map.addSource(casingSourceId, { type: "geojson", data: routeGeometry });
    map.addLayer({
      id: `${casingSourceId}-line`,
      type: "line",
      source: casingSourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#ffffff",
        "line-width": 8,
        "line-opacity": 0.9,
      },
    });

    map.addSource(baseSourceId, { type: "geojson", data: routeGeometry });
    map.addLayer({
      id: `${baseSourceId}-line`,
      type: "line",
      source: baseSourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": color,
        "line-width": 5,
        "line-opacity": 0.95,
      },
    });

    map.addSource(traveledSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [coordinates[0]] },
      },
    });
    map.addLayer({
      id: `${traveledSourceId}-line`,
      type: "line",
      source: traveledSourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#94a3b8",
        "line-width": 5,
        "line-opacity": 0.85,
      },
    });

    setupRef.current = true;

    return () => {
      [`${casingSourceId}-line`, `${baseSourceId}-line`, `${traveledSourceId}-line`].forEach(
        (layerId) => {
          if (map.getLayer(layerId)) map.removeLayer(layerId);
        },
      );
      [casingSourceId, baseSourceId, traveledSourceId].forEach((sourceId) => {
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });
      setupRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, id, color]);

  useEffect(() => {
    const source = map.getSource(traveledSourceId) as GeoJSONSource | undefined;
    if (!source) return;
    source.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: buildTraveledCoordinates(coordinates, progress / 100),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, coordinates]);

  return null;
}
