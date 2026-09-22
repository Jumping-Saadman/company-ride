import { Link } from "react-router-dom";
import { CalendarClock, MapPin } from "lucide-react";
import { useAppState } from "../../state/AppStateContext";
import { useCurrentDriver } from "../../hooks/useCurrentActor";
import { useTripDetails } from "../../hooks/useTripDetails";
import { getLocationById } from "../../data/locations";
import { isActiveTripStatus, TRIP_STATUS_META } from "../../data/constants";
import { formatTime12h, todayISODate } from "../../lib/date";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState } from "../../components/ui/EmptyState";
import { LiveTripMap } from "../../components/map/LiveTripMap";
import { SimulationControls } from "../../components/trips/SimulationControls";
import { DriverTripActions } from "../../components/trips/DriverTripActions";
import { TripStatus } from "../../types";

export default function DriverDashboard() {
  const { state } = useAppState();
  const driver = useCurrentDriver();

  const myTrips = driver ? state.trips.filter((t) => t.driverId === driver.id) : [];
  const today = todayISODate();
  const upcomingTrips = myTrips
    .filter(
      (t) =>
        t.status !== TripStatus.CANCELLED &&
        t.status !== TripStatus.COMPLETED &&
        t.scheduledDate >= today,
    )
    .sort((a, b) => (a.scheduledDate + a.scheduledTime).localeCompare(b.scheduledDate + b.scheduledTime));

  const currentTrip = myTrips.find((t) => isActiveTripStatus(t.status));
  const currentTripDetails = useTripDetails(currentTrip);

  if (!driver) return <EmptyState title="Select a demo driver to continue" />;

  return (
    <div>
      <PageHeader title={`Welcome, ${driver.name.split(" ")[0]}`} description={`${driver.vehicle.model} · ${driver.vehicle.plate}`} />

      {currentTrip && currentTripDetails?.route && currentTripDetails.pickup && currentTripDetails.destination ? (
        <Card className="mb-6 overflow-hidden">
          <CardHeader
            title="Current Trip"
            description={`${currentTripDetails.pickup.name} to ${currentTripDetails.destination.name}`}
            action={<StatusBadge meta={TRIP_STATUS_META[currentTrip.status]} />}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="h-72 lg:col-span-2 lg:h-96">
              <LiveTripMap
                route={currentTripDetails.route}
                pickup={currentTripDetails.pickup}
                destination={currentTripDetails.destination}
                vehiclePosition={currentTrip.currentPosition}
                vehicleLabel={driver.name}
                progress={currentTrip.progress}
              />
            </div>
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={currentTripDetails.employee?.name ?? "?"}
                  seed={currentTripDetails.employee?.id}
                  color={currentTripDetails.employee?.avatarColor}
                />
                <div>
                  <p className="text-sm font-semibold text-ink-900">{currentTripDetails.employee?.name}</p>
                  <p className="text-xs text-ink-500">Passenger</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-ink-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-ink-500">ETA</p>
                  <p className="font-semibold text-ink-900">{currentTrip.etaMinutes} min</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Progress</p>
                  <p className="font-semibold text-ink-900">{Math.round(currentTrip.progress)}%</p>
                </div>
              </div>
              <DriverTripActions trip={currentTrip} />
              <Link
                to={`/live-trip/${currentTrip.id}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Open full live trip view &rarr;
              </Link>
            </CardBody>
          </div>
          {currentTrip.status === TripStatus.IN_PROGRESS && (
            <div className="border-t border-ink-100 px-5 py-4">
              <SimulationControls tripId={currentTrip.id} tripStatus={currentTrip.status} />
            </div>
          )}
        </Card>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No active trip right now"
          description="Assigned trips will appear here once dispatched."
          className="mb-6"
        />
      )}

      <Card>
        <CardHeader title="Today's Schedule" description="Upcoming and today's assigned trips" />
        <CardBody className="p-0">
          {upcomingTrips.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No trips scheduled" className="border-none py-8" />
          ) : (
            <div className="divide-y divide-ink-100">
              {upcomingTrips.map((trip) => {
                const pickup = getLocationById(trip.pickupLocationId);
                const destination = getLocationById(trip.destinationLocationId);
                const employee = state.employees.find((e) => e.id === trip.employeeId);
                const active = isActiveTripStatus(trip.status);
                return (
                  <div key={trip.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 shrink-0 text-sm font-medium text-ink-700">
                        {trip.scheduledDate === today ? "Today" : trip.scheduledDate}
                        <p className="text-xs font-normal text-ink-400">{formatTime12h(trip.scheduledTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{employee?.name}</p>
                        <p className="text-xs text-ink-500">
                          {pickup?.name} &rarr; {destination?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
          )}
        </CardBody>
      </Card>
    </div>
  );
}
