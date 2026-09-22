import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { renderToStaticMarkup } from "react-dom/server";
import { Car } from "lucide-react";

interface VehicleMarkerProps {
  map: MapLibreMap;
  lat: number;
  lng: number;
  label: string;
  color?: string;
  onClick?: () => void;
}

export function VehicleMarker({
  map,
  lat,
  lng,
  label,
  color = "#7c3aed",
  onClick,
}: VehicleMarkerProps) {
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = "36px";
    wrapper.style.height = "36px";
    wrapper.style.cursor = onClick ? "pointer" : "default";

    const pulse = document.createElement("div");
    pulse.className = "vehicle-pulse";
    pulse.style.position = "absolute";
    pulse.style.inset = "0";
    pulse.style.borderRadius = "50%";
    pulse.style.background = color;
    pulse.style.opacity = "0.5";
    wrapper.appendChild(pulse);

    const iconHtml = renderToStaticMarkup(
      <Car size={16} color="white" strokeWidth={2.5} />,
    );

    const badge = document.createElement("div");
    badge.style.position = "absolute";
    badge.style.inset = "0";
    badge.style.display = "flex";
    badge.style.alignItems = "center";
    badge.style.justifyContent = "center";
    badge.style.borderRadius = "50%";
    badge.style.background = color;
    badge.style.border = "3px solid white";
    badge.style.boxShadow = "0 3px 10px rgba(15, 23, 42, 0.4)";
    badge.innerHTML = iconHtml;
    wrapper.appendChild(badge);

    if (onClick) {
      wrapper.addEventListener("click", onClick);
    }

    const popup = new maplibregl.Popup({ offset: 20, closeButton: false }).setHTML(
      `<div style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:500;color:#0f172a">${label}</div>`,
    );

    const marker = new maplibregl.Marker({ element: wrapper })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, color, label, onClick]);

  useEffect(() => {
    markerRef.current?.setLngLat([lng, lat]);
  }, [lat, lng]);

  return null;
}
