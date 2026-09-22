import { LocationType } from "../types";

/**
 * How each kind of company site is drawn on the map. The colours are
 * deliberately deep and desaturated: landmarks are permanent scenery, so they
 * must stay legible without competing with the bright route lines and vehicle
 * pucks layered on top of them.
 */
export interface LandmarkStyle {
  color: string;
  /** Inner markup of a 24x24 stroked lucide icon, drawn white on `color`. */
  glyph: string;
}

const GLYPHS = {
  building2:
    '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/>',
  factory:
    '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
  briefcase:
    '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  building:
    '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>',
  plane:
    '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.2.6-.6.5-1.1z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
};

export const LANDMARK_STYLES: Record<LocationType, LandmarkStyle> = {
  [LocationType.HEADQUARTERS]: { color: "#0f172a", glyph: GLYPHS.building2 },
  [LocationType.BRANCH]: { color: "#115e59", glyph: GLYPHS.building },
  [LocationType.FACTORY]: { color: "#92400e", glyph: GLYPHS.factory },
  [LocationType.CLIENT_OFFICE]: { color: "#4c1d95", glyph: GLYPHS.briefcase },
  [LocationType.AIRPORT]: { color: "#334155", glyph: GLYPHS.plane },
  [LocationType.OTHER]: { color: "#475569", glyph: GLYPHS.pin },
};

/** A 24x24 lucide-style icon rendered white inside a rounded badge. */
export function landmarkIconSvg(type: LocationType, size = 15): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LANDMARK_STYLES[type].glyph}</svg>`;
}
