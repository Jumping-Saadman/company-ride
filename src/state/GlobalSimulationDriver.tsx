import { useEffect, useRef } from "react";
import { useAppActions, useAppState } from "./AppStateContext";
import { getRouteById } from "../data/routes";
import { getSnapshotAtProgress, progressDeltaForElapsed } from "../lib/simulation";
import { SimulationSpeed, TripStatus } from "../types";

const UPDATE_INTERVAL_MS = 200;

interface TrackedTrip {
  progressFraction: number;
  lastTick: number;
}

/**
 * Mounted once at the app root. Advances every in-progress trip's simulated
 * GPS position continuously, regardless of which page is currently open, so
 * trips keep moving in the background like a real dispatch system rather
 * than only animating while their Live Trip page happens to be mounted.
 *
 * A trip plays automatically as soon as it becomes `in_progress` (no
 * playback entry defaults to playing); pausing/resetting a specific trip is
 * still controlled per-trip via SimulationControls.
 */
export function GlobalSimulationDriver() {
  const { state } = useAppState();
  const { updateTripPosition } = useAppActions();
  const tracked = useRef<Map<string, TrackedTrip>>(new Map());
  const rafRef = useRef<number | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;

    const tick = (timestamp: number) => {
      if (cancelled) return;

      const current = stateRef.current;
      const activeIds = new Set<string>();

      for (const trip of current.trips) {
        if (trip.status !== TripStatus.IN_PROGRESS) continue;
        const playback = current.playback[trip.id];
        const isPlaying = playback?.isPlaying ?? true;
        if (!isPlaying) continue;

        activeIds.add(trip.id);
        const route = getRouteById(trip.routeId);
        if (!route) continue;

        let entry = tracked.current.get(trip.id);
        if (!entry) {
          entry = { progressFraction: trip.progress / 100, lastTick: timestamp };
          tracked.current.set(trip.id, entry);
          continue;
        }

        const elapsed = timestamp - entry.lastTick;
        if (elapsed < UPDATE_INTERVAL_MS) continue;

        entry.lastTick = timestamp;
        const speed: SimulationSpeed = playback?.speed ?? 1;
        const delta = progressDeltaForElapsed(route, elapsed, speed);
        entry.progressFraction = Math.min(1, entry.progressFraction + delta);

        const snapshot = getSnapshotAtProgress(route, entry.progressFraction);
        updateTripPosition(trip.id, snapshot);
      }

      // Drop tracking for trips that are no longer actively playing so a
      // future resume (or reset) re-syncs from the current state instead of
      // a stale cached position.
      for (const id of tracked.current.keys()) {
        if (!activeIds.has(id)) tracked.current.delete(id);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // Runs once; reads latest state via stateRef to avoid restarting the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
