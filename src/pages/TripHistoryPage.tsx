import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Route as RouteIcon } from "lucide-react";
import { useAppState } from "../state/AppStateContext";
import { useCurrentDriver, useCurrentEmployee } from "../hooks/useCurrentActor";
import { getLocationById } from "../data/locations";
import { isActiveTripStatus, TRIP_STATUS_META } from "../data/constants";
import { formatDateLong } from "../lib/date";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { Input, Select } from "../components/ui/FormField";
import { EmptyState } from "../components/ui/EmptyState";
import { Drawer } from "../components/ui/Drawer";
import { TripStatusTimeline } from "../components/trips/TripStatusTimeline";
import { TripStatus } from "../types";

export default function TripHistoryPage() {
  const { state } = useAppState();
  const employee = useCurrentEmployee();
  const driver = useCurrentDriver();
  const role = state.currentUser.role;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scopedTrips = useMemo(() => {
    if (role === "employee") return state.trips.filter((t) => t.employeeId === employee?.id);
    if (role === "driver") return state.trips.filter((t) => t.driverId === driver?.id);
    return state.trips;
  }, [state.trips, role, employee?.id, driver?.id]);

  const filtered = scopedTrips
    .filter((t) => (statusFilter === "all" ? true : t.status === statusFilter))
    .filter((t) => (driverFilter === "all" ? true : t.driverId === driverFilter))
    .filter((t) => (employeeFilter === "all" ? true : t.employeeId === employeeFilter))
    .filter((t) => {
      if (!search.trim()) return true;
      const emp = state.employees.find((e) => e.id === t.employeeId);
      const drv = state.drivers.find((d) => d.id === t.driverId);
      const haystack = `${t.id} ${emp?.name ?? ""} ${drv?.name ?? ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    })
    .sort((a, b) => (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt));

  const selectedTrip = state.trips.find((t) => t.id === selectedTripId) ?? null;

  return (
    <div>
      <PageHeader
        title={role === "admin" ? "Trip History" : "My Trips"}
        description="Full record of business travel trips."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input placeholder="Search by trip ID, employee, or driver" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
          <option value="all">All Statuses</option>
          {Object.values(TripStatus).map((s) => (
            <option key={s} value={s}>
              {TRIP_STATUS_META[s].label}
            </option>
          ))}
        </Select>
        {role === "admin" && (
          <>
            <Select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="sm:w-44">
              <option value="all">All Employees</option>
              {state.employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Select>
            <Select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} className="sm:w-44">
              <option value="all">All Drivers</option>
              {state.drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </>
        )}
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={RouteIcon} title="No trips found" className="border-none py-14" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Trip ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Driver</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Distance</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const emp = state.employees.find((e) => e.id === t.employeeId);
                  const drv = state.drivers.find((d) => d.id === t.driverId);
                  const pickup = getLocationById(t.pickupLocationId);
                  const destination = getLocationById(t.destinationLocationId);
                  const active = isActiveTripStatus(t.status);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => {
                        setSelectedTripId(t.id);
                        setDrawerOpen(true);
                      }}
                      className="cursor-pointer border-b border-ink-50 last:border-none hover:bg-ink-50"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-ink-600">{t.id}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-700">{formatDateLong(t.scheduledDate)}</td>
                      <td className="px-5 py-3.5 text-ink-800">{emp?.name}</td>
                      <td className="px-5 py-3.5 text-ink-800">{drv?.name}</td>
                      <td className="px-5 py-3.5 text-ink-600">
                        {pickup?.name} &rarr; {destination?.name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-600">
                        {t.durationMinutes ? `${t.durationMinutes} min` : "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-600">{t.totalDistanceKm} km</td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <StatusBadge meta={TRIP_STATUS_META[t.status]} />
                          {active && (
                            <Link
                              to={`/live-trip/${t.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-medium text-brand-600 hover:text-brand-700"
                            >
                              Live
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedTrip?.id ?? ""}
      >
        {selectedTrip && (
          <TripDetailContent tripId={selectedTrip.id} />
        )}
      </Drawer>
    </div>
  );
}

function TripDetailContent({ tripId }: { tripId: string }) {
  const { state } = useAppState();
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return null;
  const emp = state.employees.find((e) => e.id === trip.employeeId);
  const drv = state.drivers.find((d) => d.id === trip.driverId);
  const pickup = getLocationById(trip.pickupLocationId);
  const destination = getLocationById(trip.destinationLocationId);

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-ink-50 p-3 text-sm">
        <div>
          <p className="text-xs text-ink-500">Employee</p>
          <p className="font-medium text-ink-900">{emp?.name}</p>
        </div>
        <div>
          <p className="text-xs text-ink-500">Driver</p>
          <p className="font-medium text-ink-900">{drv?.name}</p>
        </div>
        <div>
          <p className="text-xs text-ink-500">Pickup</p>
          <p className="font-medium text-ink-900">{pickup?.name}</p>
        </div>
        <div>
          <p className="text-xs text-ink-500">Destination</p>
          <p className="font-medium text-ink-900">{destination?.name}</p>
        </div>
        <div>
          <p className="text-xs text-ink-500">Distance</p>
          <p className="font-medium text-ink-900">{trip.totalDistanceKm} km</p>
        </div>
        <div>
          <p className="text-xs text-ink-500">Duration</p>
          <p className="font-medium text-ink-900">{trip.durationMinutes ? `${trip.durationMinutes} min` : "-"}</p>
        </div>
      </div>
      <p className="mb-2 text-sm font-semibold text-ink-900">Timeline</p>
      <TripStatusTimeline timeline={trip.timeline} currentStatus={trip.status} />
    </div>
  );
}
