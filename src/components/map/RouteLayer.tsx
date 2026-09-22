import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import { computeRouteMetrics, interpolateAlongRoute } from "../../lib/geo";

interface RouteLayerProps {
  map: MapLibreMap;
  id: string;
  coordinates: [number, number][];
  progress?: number; // 0-100; the driven portion is removed from the line as it advances
  color?: string;
}

/**
 * Returns only the road ahead of the given progress fraction, prefixed with
 * the vehicle's exact interpolated position so the line's tail always starts
 * right under the marker. Returns null once progress reaches 100 - the route
 * has been fully "eaten" and there is nothing left to draw.
 */
function buildRemainingCoordinates(
  coordinates: [number, number][],
  progressFraction: number,
): [number, number][] | null {
  if (progressFraction >= 1) return null;
  if (progressFraction <= 0) return coordinates;

  const { distanceKm, cumulativeKm } = computeRouteMetrics(coordinates);
  const targetKm = distanceKm * progressFraction;
  const current = interpolateAlongRoute(
    coordinates,
    cumulativeKm,
    distanceKm,
    progressFraction,
  );
  const result: [number, number][] = [[current.lng, current.lat]];

  for (let i = 0; i < coordinates.length; i++) {
    if (cumulativeKm[i] > targetKm) result.push(coordinates[i]);
  }
  return result;
}

/**
 * Renders a route the way turn-by-turn navigation apps do: a soft white
 * casing beneath a solid, rounded directions line in the vehicle/brand
 * color for the road ahead. As the vehicle advances, the driven portion is
 * removed from the line entirely (rather than redrawn in another color) so
 * the highlighted path is visibly "eaten up" behind the car.
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

    setupRef.current = true;

    return () => {
      [`${casingSourceId}-line`, `${baseSourceId}-line`].forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      });
      [casingSourceId, baseSourceId].forEach((sourceId) => {
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });
      setupRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, id, color]);

  useEffect(() => {
    const casingSource = map.getSource(casingSourceId) as GeoJSONSource | undefined;
    const baseSource = map.getSource(baseSourceId) as GeoJSONSource | undefined;
    if (!casingSource || !baseSource) return;

    const remaining = buildRemainingCoordinates(coordinates, progress / 100);
    const visibility = remaining ? "visible" : "none";
    [`${casingSourceId}-line`, `${baseSourceId}-line`].forEach((layerId) => {
      if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", visibility);
    });
    if (!remaining) return;

    const feature = {
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: remaining },
    };
    casingSource.setData(feature);
    baseSource.setData(feature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, coordinates]);

  return null;
}
