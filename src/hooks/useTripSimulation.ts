import { useEffect, useRef } from "react";
import { useAppActions, useAppSelector } from "../state/AppStateContext";
import { getRouteById } from "../data/routes";
import { getSnapshotAtProgress, progressDeltaForElapsed } from "../lib/simulation";
import { SimulationSpeed, Trip, TripStatus } from "../types";

const UPDATE_INTERVAL_MS = 200;

/**
 * Drives simulated GPS movement for a single trip. Only animates while the
 * trip is `in_progress` and its playback state is set to playing. Position
 * updates are dispatched to shared state so the map, ETA, and progress
 * displays stay in sync across any screen viewing this trip.
 */
export function useTripSimulation(trip: Trip | undefined) {
  const { updateTripPosition } = useAppActions();
  const playback = useAppSelector((s) =>
    trip ? s.playback[trip.id] : undefined,
  );

  const isPlaying = playback?.isPlaying ?? false;
  const speed: SimulationSpeed = playback?.speed ?? 1;

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const progressRef = useRef<number>((trip?.progress ?? 0) / 100);

  useEffect(() => {
    progressRef.current = (trip?.progress ?? 0) / 100;
  }, [trip?.id]);

  useEffect(() => {
    if (!trip || trip.status !== TripStatus.IN_PROGRESS || !isPlaying) {
      lastTickRef.current = null;
      return;
    }

    const route = getRouteById(trip.routeId);
    if (!route) return;

    let cancelled = false;

    const tick = (timestamp: number) => {
      if (cancelled) return;
      if (lastTickRef.current === null) {
        lastTickRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = timestamp - lastTickRef.current;

      if (elapsed >= UPDATE_INTERVAL_MS) {
        lastTickRef.current = timestamp;
        const delta = progressDeltaForElapsed(route, elapsed, speed);
        progressRef.current = Math.min(1, progressRef.current + delta);

        const snapshot = getSnapshotAtProgress(route, progressRef.current);
        updateTripPosition(trip.id, snapshot);

        if (progressRef.current >= 1) {
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id, trip?.status, isPlaying, speed]);
}
