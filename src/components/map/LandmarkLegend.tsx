import { PINNED_LOCATIONS, LOCATION_TYPE_LABELS } from "../../data/locations";
import { LANDMARK_STYLES } from "../../lib/landmarkStyle";
import type { LocationType } from "../../types";

/** The landmark kinds we actually have sites for, in the data's own order. */
function pinnedTypes(): LocationType[] {
  const seen = new Set<LocationType>();
  for (const location of PINNED_LOCATIONS) seen.add(location.type);
  return [...seen];
}

interface LandmarkLegendProps {
  className?: string;
}

/**
 * Keys the always-on landmark badges drawn by `LandmarkLayer`. Sized to sit as
 * an overlay in a map's bottom-left corner without covering the attribution.
 */
export function LandmarkLegend({ className = "" }: LandmarkLegendProps) {
  return (
    <div
      className={`pointer-events-none absolute bottom-3 left-3 z-10 rounded-xl border border-ink-200/70 bg-white/90 px-3 py-2.5 shadow-lg backdrop-blur-sm ${className}`}
    >
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
        Company Sites
      </p>
      <ul className="space-y-1.5">
        {pinnedTypes().map((type) => (
          <li key={type} className="flex items-center gap-2">
            <span
              className="flex h-4 w-4 items-center justify-center rounded-[5px]"
              style={{ background: LANDMARK_STYLES[type].color }}
              // Static icon markup shared with the map badges.
              dangerouslySetInnerHTML={{
                __html: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${LANDMARK_STYLES[type].glyph}</svg>`,
              }}
            />
            <span className="text-[11px] font-medium text-ink-700">
              {LOCATION_TYPE_LABELS[type]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
