import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { useAppState } from "../../state/AppStateContext";
import { useCurrentDriver } from "../../hooks/useCurrentActor";
import { getLocationById } from "../../data/locations";
import { isActiveTripStatus, TRIP_STATUS_META } from "../../data/constants";
import { formatDateLong, formatTime12h } from "../../lib/date";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { DriverTripActions } from "../../components/trips/DriverTripActions";
import { TripStatus } from "../../types";

export default function DriverSchedule() {
  const { state } = useAppState();
  const driver = useCurrentDriver();

  if (!driver) return <EmptyState title="Select a demo driver to continue" />;

  const myTrips = state.trips
    .filter((t) => t.driverId === driver.id && t.status !== TripStatus.CANCELLED)
    .sort((a, b) => (b.scheduledDate + b.scheduledTime).localeCompare(a.scheduledDate + a.scheduledTime));

  return (
    <div>
      <PageHeader title="Today's Trips" description="All trips assigned to you, chronologically." />

      {myTrips.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No trips assigned yet" />
      ) : (
        <Card>
          <div className="divide-y divide-ink-100">
            {myTrips.map((trip) => {
              const pickup = getLocationById(trip.pickupLocationId);
              const destination = getLocationById(trip.destinationLocationId);
              const employee = state.employees.find((e) => e.id === trip.employeeId);
              const active = isActiveTripStatus(trip.status);
              return (
                <div key={trip.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {formatDateLong(trip.scheduledDate)} &middot; {formatTime12h(trip.scheduledTime)}
                    </p>
                    <p className="text-sm text-ink-600">{employee?.name}</p>
                    <p className="text-xs text-ink-500">
                      {pickup?.name} &rarr; {destination?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge meta={TRIP_STATUS_META[trip.status]} />
                    {active ? (
                      <Link to={`/live-trip/${trip.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                        View Live
                      </Link>
                    ) : trip.status === TripStatus.SCHEDULED ? (
                      <DriverTripActions trip={trip} />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
