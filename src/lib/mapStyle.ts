import type { StyleSpecification } from "maplibre-gl";

// Free OpenStreetMap raster tiles - no API key required. Suitable for a
// frontend demo; a production app would use a dedicated tile provider.
export const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const DHAKA_CENTER: [number, number] = [90.4067, 23.79];
