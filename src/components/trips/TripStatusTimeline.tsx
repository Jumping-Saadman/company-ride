import { Check } from "lucide-react";
import { TripTimelineEvent } from "../../types";
import { formatTimestamp } from "../../lib/date";

interface TripStatusTimelineProps {
  timeline: TripTimelineEvent[];
  currentStatus: string;
}

export function TripStatusTimeline({ timeline, currentStatus }: TripStatusTimelineProps) {
  return (
    <ol className="space-y-0">
      {timeline.map((event, i) => {
        const isCurrent = event.status === currentStatus && i === timeline.length - 1;
        const isLast = i === timeline.length - 1;
        return (
          <li key={`${event.status}-${i}`} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span className="absolute left-[11px] top-6 h-full w-px bg-ink-200" aria-hidden="true" />
            )}
            <span
              className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                isCurrent
                  ? "bg-brand-600 text-white"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              <Check size={13} strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${isCurrent ? "text-brand-700" : "text-ink-800"}`}>
                {event.label}
              </p>
              <p className="text-xs text-ink-400">{formatTimestamp(event.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
