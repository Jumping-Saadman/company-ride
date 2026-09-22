import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import { OSM_STYLE, DHAKA_CENTER } from "../../lib/mapStyle";

interface MapViewProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  children?: (map: MapLibreMap) => React.ReactNode;
}

/**
 * Owns the lifecycle of a single MapLibre GL instance. Child rendering logic
 * (markers, routes) is supplied via a render-prop once the map has loaded, so
 * callers never re-create the underlying map on every render.
 */
export function MapView({
  className,
  initialCenter = DHAKA_CENTER,
  initialZoom = 12,
  children,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [loadedMap, setLoadedMap] = useState<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      setLoadedMap(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setLoadedMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {loadedMap ? children?.(loadedMap) : null}
    </div>
  );
}
