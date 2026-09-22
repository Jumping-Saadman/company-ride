import { StatusBadge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { TRIP_STATUS_META } from "../../data/constants";
import { Trip, Employee, Driver, Location } from "../../types";

interface TripInfoPanelProps {
  trip: Trip;
  employee?: Employee;
  driver?: Driver;
  pickup?: Location;
  destination?: Location;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-2.5 last:border-none">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-sm font-medium text-ink-900">{value}</span>
    </div>
  );
}

export function TripInfoPanel({ trip, employee, driver, pickup, destination }: TripInfoPanelProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={employee?.name ?? "?"} seed={employee?.id} color={employee?.avatarColor} />
          <div>
            <p className="text-sm font-semibold text-ink-900">{employee?.name ?? "Unknown"}</p>
            <p className="text-xs text-ink-500">Passenger</p>
          </div>
        </div>
        <StatusBadge meta={TRIP_STATUS_META[trip.status]} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-ink-50 p-3">
        <div>
          <p className="text-xs text-ink-500">ETA</p>
          <p className="text-lg font-semibold text-ink-900">{trip.etaMinutes} min</p>
        </div>
        <div>
          <p className="text-xs text-ink-500">Distance Remaining</p>
          <p className="text-lg font-semibold text-ink-900">{trip.distanceRemainingKm} km</p>
        </div>
        <div className="col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-ink-500">Progress</p>
            <p className="text-xs font-medium text-ink-700">{Math.round(trip.progress)}%</p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-300"
              style={{ width: `${Math.min(100, trip.progress)}%` }}
            />
          </div>
        </div>
      </div>

      <Row label="Driver" value={driver?.name ?? "Unassigned"} />
      <Row label="Vehicle" value={driver?.vehicle.model ?? "-"} />
      <Row label="License" value={driver?.vehicle.plate ?? "-"} />
      <Row label="Pickup" value={pickup?.name ?? "-"} />
      <Row label="Destination" value={destination?.name ?? "-"} />
    </div>
  );
}
