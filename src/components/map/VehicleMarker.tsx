import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { bearingBetween } from "../../lib/geo";

// Top-down car silhouette (Uber-style live-tracking puck): body, glass, and
// headlights, sized so its geometric center sits at the marker's anchor
// point. Drawn nose-up (0deg = north) so a CSS rotation to the travel
// bearing reads as the car actually turning to face the road ahead.
function carSvgMarkup(color: string): string {
  return `
    <svg width="30" height="52" viewBox="0 0 30 52" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="15" cy="46" rx="9" ry="3" fill="rgba(15,23,42,0.35)" />
      <rect x="1.5" y="3" width="27" height="44" rx="10" fill="${color}" stroke="white" stroke-width="2.5" />
      <rect x="1.5" y="3" width="27" height="22" rx="10" fill="white" opacity="0.16" />
      <rect x="6" y="9" width="18" height="12" rx="4" fill="#1e293b" opacity="0.7" />
      <rect x="6" y="29" width="18" height="9" rx="3" fill="#1e293b" opacity="0.45" />
      <circle cx="6.5" cy="8" r="1.6" fill="#fde68a" />
      <circle cx="23.5" cy="8" r="1.6" fill="#fde68a" />
      <rect x="-1" y="17" width="3" height="7" rx="1.3" fill="#0f172a" opacity="0.5" />
      <rect x="28" y="17" width="3" height="7" rx="1.3" fill="#0f172a" opacity="0.5" />
    </svg>
  `;
}

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
  const iconRef = useRef<HTMLDivElement | null>(null);
  const prevPosRef = useRef<[number, number] | null>(null);
  const bearingRef = useRef(0);

  useEffect(() => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = "30px";
    wrapper.style.height = "52px";
    wrapper.style.cursor = onClick ? "pointer" : "default";
    // Smooths out the marker's movement between simulation ticks instead of
    // visibly jumping every ~200ms; maplibre applies position via a raw CSS
    // transform on this element, so a transition on it animates the glide.
    wrapper.style.transition = "transform 220ms linear";

    const iconWrapper = document.createElement("div");
    iconWrapper.style.width = "100%";
    iconWrapper.style.height = "100%";
    // Rotation happens on this inner element (not the outer wrapper, whose
    // transform maplibre owns for positioning) so heading changes turn the
    // car smoothly without fighting the position transition above.
    iconWrapper.style.transition = "transform 260ms ease-out";
    iconWrapper.style.transformOrigin = "50% 50%";
    iconWrapper.style.filter = "drop-shadow(0 3px 6px rgba(15, 23, 42, 0.45))";
    iconWrapper.innerHTML = carSvgMarkup(color);
    wrapper.appendChild(iconWrapper);
    iconRef.current = iconWrapper;

    if (onClick) {
      wrapper.addEventListener("click", onClick);
    }

    const popup = new maplibregl.Popup({ offset: 28, closeButton: false }).setHTML(
      `<div style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:500;color:#0f172a">${label}</div>`,
    );

    const marker = new maplibregl.Marker({ element: wrapper })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;
    prevPosRef.current = [lng, lat];

    return () => {
      marker.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, color, label, onClick]);

  useEffect(() => {
    markerRef.current?.setLngLat([lng, lat]);

    const prev = prevPosRef.current;
    if (prev && (prev[0] !== lng || prev[1] !== lat)) {
      const bearing = bearingBetween(prev, [lng, lat]);
      bearingRef.current = bearing;
      if (iconRef.current) {
        // The car SVG is drawn nose-up (0deg = north) by default.
        iconRef.current.style.transform = `rotate(${bearing}deg)`;
      }
    }
    prevPosRef.current = [lng, lat];
  }, [lat, lng]);

  return null;
}
