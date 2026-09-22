import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";

interface LocationMarkerProps {
  map: MapLibreMap;
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  color?: string;
  variant?: "pickup" | "destination" | "default";
}

const VARIANT_COLOR: Record<NonNullable<LocationMarkerProps["variant"]>, string> = {
  pickup: "#2563eb",
  destination: "#dc2626",
  default: "#64748b",
};

export function LocationMarker({
  map,
  lat,
  lng,
  label,
  sublabel,
  color,
  variant = "default",
}: LocationMarkerProps) {
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.style.width = "18px";
    el.style.height = "18px";
    el.style.borderRadius = "50%";
    el.style.background = color ?? VARIANT_COLOR[variant];
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 2px 6px rgba(15, 23, 42, 0.35)";

    const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(
      `<div style="font-family:Inter,system-ui,sans-serif"><strong style="display:block;font-size:13px;color:#0f172a">${label}</strong>${
        sublabel ? `<span style="font-size:12px;color:#64748b">${sublabel}</span>` : ""
      }</div>`,
    );

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    markerRef.current?.setLngLat([lng, lat]);
  }, [lat, lng]);

  return null;
}
