import { Pause, Play, RotateCcw, Radio } from "lucide-react";
import { useAppActions, useAppSelector } from "../../state/AppStateContext";
import { SimulationSpeed, TripStatus } from "../../types";

const SPEEDS: SimulationSpeed[] = [1, 2, 4];

export function SimulationControls({
  tripId,
  tripStatus,
}: {
  tripId: string;
  tripStatus: TripStatus;
}) {
  const { setPlayback, resetPlayback } = useAppActions();
  const playback = useAppSelector((s) => s.playback[tripId]);
  const isPlaying = playback?.isPlaying ?? false;
  const speed = playback?.speed ?? 1;
  const disabled = tripStatus !== TripStatus.IN_PROGRESS;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-ink-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
        <Radio size={13} className={isPlaying ? "text-emerald-500" : "text-ink-400"} />
        Simulation
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPlayback(tripId, { isPlaying: !isPlaying })}
          disabled={disabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
          aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={() => resetPlayback(tripId)}
          disabled={disabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
          aria-label="Reset simulation"
        >
          <RotateCcw size={13} />
        </button>
      </div>
      <div className="flex items-center gap-1 rounded-lg bg-ink-100 p-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setPlayback(tripId, { speed: s })}
            disabled={disabled}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40 ${
              speed === s ? "bg-white text-brand-700 shadow-sm" : "text-ink-500"
            }`}
          >
            {s}&times;
          </button>
        ))}
      </div>
      {disabled && (
        <span className="text-xs text-ink-400">
          Available once the trip is in progress
        </span>
      )}
    </div>
  );
}
