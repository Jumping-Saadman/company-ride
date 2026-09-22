import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as maplibregl from 'maplibre-gl'
// maplibre-gl computes its worker script's URL dynamically at runtime, which
// bundlers can't statically discover - without this, the worker 404s in a
// production build and GeoJSON route layers silently never render. Routing
// it through Vite's worker pipeline (?worker&url) bundles the worker's own
// internal imports into one self-contained file and gives us a real,
// build-hashed URL to hand back to maplibre.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import './index.css'
import App from './App.tsx'

maplibregl.setWorkerUrl(maplibreWorkerUrl)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
