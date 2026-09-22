import { useEffect } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import {
  PINNED_LOCATIONS,
  LOCATION_TYPE_LABELS,
  getLocationById,
} from "../../data/locations";
import { LANDMARK_STYLES, landmarkIconSvg } from "../../lib/landmarkStyle";
import type { Location } from "../../types";

interface LandmarkLayerProps {
  map: MapLibreMap;
  /**
   * Locations already drawn by the caller with a trip-specific marker (a
   * pickup or destination pin), so we don't stack two markers on one point.
   */
  excludeIds?: string[];
  /** Below this zoom only the badges are drawn, without their name chips. */
  labelMinZoom?: number;
}

/** Roughly the footprint of a badge plus its name chip, in screen pixels. */
const LABEL_CLEARANCE_PX = { x: 70, y: 26 };

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );

function createLandmarkElement(location: Location) {
  const { color } = LANDMARK_STYLES[location.type];

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "3px";
  wrapper.style.cursor = "pointer";
  // Landmarks are scenery: they sit under the route lines' markers so a moving
  // vehicle is never hidden behind a static site badge.
  wrapper.style.zIndex = "1";

  const badge = document.createElement("div");
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.justifyContent = "center";
  badge.style.width = "26px";
  badge.style.height = "26px";
  badge.style.borderRadius = "9px";
  badge.style.background = color;
  badge.style.border = "2px solid white";
  badge.style.boxShadow = "0 2px 6px rgba(15, 23, 42, 0.35)";
  badge.innerHTML = landmarkIconSvg(location.type);
  wrapper.appendChild(badge);

  const label = document.createElement("span");
  label.textContent = location.name;
  label.style.maxWidth = "132px";
  label.style.overflow = "hidden";
  label.style.textOverflow = "ellipsis";
  label.style.whiteSpace = "nowrap";
  label.style.padding = "1px 6px";
  label.style.borderRadius = "999px";
  label.style.background = "rgba(255, 255, 255, 0.92)";
  label.style.color = "#0f172a";
  label.style.fontFamily = "Inter, system-ui, sans-serif";
  label.style.fontSize = "10.5px";
  label.style.fontWeight = "600";
  label.style.lineHeight = "15px";
  label.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.25)";
  label.style.pointerEvents = "none";
  wrapper.appendChild(label);

  return { wrapper, label };
}

function landmarkPopupHtml(location: Location) {
  const { color } = LANDMARK_STYLES[location.type];
  return `
    <div style="font-family:Inter,system-ui,sans-serif;min-width:150px">
      <span style="display:inline-block;margin-bottom:4px;padding:1px 7px;border-radius:999px;background:${color};color:white;font-size:10px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase">${escapeHtml(
        LOCATION_TYPE_LABELS[location.type],
      )}</span>
      <strong style="display:block;font-size:13px;color:#0f172a">${escapeHtml(location.name)}</strong>
      <span style="font-size:12px;color:#64748b">${escapeHtml(location.address)}</span>
    </div>
  `;
}

/**
 * Draws our permanent sites - HQ, the corporate branch, the factories and the
 * clients we visit regularly - on any map, whether or not a trip currently
 * touches them. Mounted by every map surface so the fleet is always read
 * against the same fixed picture of the company's footprint.
 */
export function LandmarkLayer({
  map,
  excludeIds,
  labelMinZoom = 11.5,
}: LandmarkLayerProps) {
  const excludeKey = (excludeIds ?? []).join(",");

  useEffect(() => {
    const excluded = new Set(excludeKey ? excludeKey.split(",") : []);
    const markers: Marker[] = [];
    const drawn: { location: Location; label: HTMLElement }[] = [];

    for (const location of PINNED_LOCATIONS) {
      if (excluded.has(location.id)) continue;

      const { wrapper, label } = createLandmarkElement(location);
      const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(
        landmarkPopupHtml(location),
      );

      markers.push(
        new maplibregl.Marker({ element: wrapper })
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map),
      );
      drawn.push({ location, label });
    }

    // The pins the caller draws itself (pickup/destination) sit above ours, so
    // they claim their screen space before any landmark label does.
    const claimedBy = [...excluded]
      .map(getLocationById)
      .filter((l): l is Location => l !== undefined);

    /**
     * Name chips would pile into each other on a city-wide view, so they only
     * appear once the map is zoomed in far enough - and even then a chip is
     * dropped if a marker already drawn nearby would overlap it.
     */
    const syncLabels = () => {
      const zoomedIn = map.getZoom() >= labelMinZoom;
      const claimed = claimedBy.map((l) => map.project([l.lng, l.lat]));

      for (const { location, label } of drawn) {
        const point = map.project([location.lng, location.lat]);
        const collides = claimed.some(
          (p) => Math.abs(p.x - point.x) < LABEL_CLEARANCE_PX.x &&
            Math.abs(p.y - point.y) < LABEL_CLEARANCE_PX.y,
        );
        label.style.display = zoomedIn && !collides ? "block" : "none";
        if (!collides) claimed.push(point);
      }
    };
    syncLabels();
    map.on("move", syncLabels);

    return () => {
      map.off("move", syncLabels);
      markers.forEach((marker) => marker.remove());
    };
  }, [map, excludeKey, labelMinZoom]);

  return null;
}
