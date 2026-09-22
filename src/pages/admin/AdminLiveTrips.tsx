import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio } from "lucide-react";
import { useAppState } from "../../state/AppStateContext";
import { getRouteById } from "../../data/routes";
import { isActiveTripStatus, TRIP_STATUS_META } from "../../data/constants";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardHeader } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { FleetMap, FleetVehicle } from "../../components/map/FleetMap";

const FLEET_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];

export default function AdminLiveTrips() {
  const { state } = useAppState();
  const [focusedTripId, setFocusedTripId] = useState<string | null>(null);

  const activeTrips = state.trips.filter((t) => isActiveTripStatus(t.status));

  useEffect(() => {
    if (!focusedTripId && activeTrips.length > 0) {
      setFocusedTripId(activeTrips[0].id);
    }
  }, [activeTrips, focusedTripId]);

  const vehicles: FleetVehicle[] = activeTrips
    .map((trip, i) => {
      const route = getRouteById(trip.routeId);
      if (!route) return null;
      const driver = state.drivers.find((d) => d.id === trip.driverId);
      return {
        tripId: trip.id,
        label: `${driver?.name ?? "Driver"} · ${driver?.vehicle.model ?? ""}`,
        color: FLEET_COLORS[i % FLEET_COLORS.length],
        position: trip.currentPosition,
        route,
        progress: trip.progress,
      };
    })
    .filter((v): v is FleetVehicle => v !== null);

  return (
    <div>
      <PageHeader
        title="Live Trips"
        description="Real-time monitoring of every vehicle currently on the road."
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Live Trips" }]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          {/* The map stays up even with nothing on the road - it is also our
              map of the company's sites, not just of live vehicles. */}
          <div className="relative h-[420px] w-full sm:h-[560px]">
            <FleetMap
              vehicles={vehicles}
              focusedTripId={focusedTripId}
              onSelectVehicle={setFocusedTripId}
            />
            {vehicles.length === 0 && (
              <div className="pointer-events-none absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-ink-200/70 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-ink-500 shadow-lg backdrop-blur-sm">
                <Radio className="h-3.5 w-3.5" />
                No active trips right now
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Active Trips" description={`${activeTrips.length} in progress`} />
          <div className="max-h-[560px] divide-y divide-ink-100 overflow-y-auto">
            {activeTrips.length === 0 ? (
              <EmptyState title="Nothing active" className="border-none py-10" />
            ) : (
              activeTrips.map((trip) => {
                const employee = state.employees.find((e) => e.id === trip.employeeId);
                const driver = state.drivers.find((d) => d.id === trip.driverId);
                return (
                  <button
                    key={trip.id}
                    onClick={() => setFocusedTripId(trip.id)}
                    className={`block w-full px-4 py-3.5 text-left hover:bg-ink-50 ${
                      focusedTripId === trip.id ? "bg-brand-50/60" : ""
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-ink-900">{trip.id}</p>
                      <StatusBadge meta={TRIP_STATUS_META[trip.status]} />
                    </div>
                    <p className="text-xs text-ink-500">
                      {employee?.name} &middot; {driver?.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
                      <span>ETA {trip.etaMinutes} min</span>
                      <span>{Math.round(trip.progress)}%</span>
                    </div>
                    <Link
                      to={`/live-trip/${trip.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-block text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      Open Live Trip &rarr;
                    </Link>
                  </button>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
