import { Link } from "react-router-dom";
import { PlusCircle, MapPin, CalendarClock, History } from "lucide-react";
import { useAppState } from "../../state/AppStateContext";
import { useCurrentEmployee } from "../../hooks/useCurrentActor";
import { useTripSimulation } from "../../hooks/useTripSimulation";
import { useTripDetails } from "../../hooks/useTripDetails";
import { getLocationById } from "../../data/locations";
import { getDriverById } from "../../data/drivers";
import { isActiveTripStatus, TRIP_STATUS_META, RIDE_REQUEST_STATUS_META } from "../../data/constants";
import { formatDateLong, formatTime12h } from "../../lib/date";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState } from "../../components/ui/EmptyState";
import { LiveTripMap } from "../../components/map/LiveTripMap";
import { SimulationControls } from "../../components/trips/SimulationControls";
import { TripStatus } from "../../types";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function EmployeeDashboard() {
  const { state } = useAppState();
  const employee = useCurrentEmployee();

  const myTrips = state.trips.filter((t) => t.employeeId === employee?.id);
  const myRequests = state.rideRequests.filter((r) => r.employeeId === employee?.id);

  const activeTrip = myTrips.find((t) => isActiveTripStatus(t.status));
  const activeTripDetails = useTripDetails(activeTrip);
  useTripSimulation(activeTrip);

  const upcomingTrip = myTrips
    .filter((t) => t.status === TripStatus.SCHEDULED)
    .sort((a, b) => (a.scheduledDate + a.scheduledTime).localeCompare(b.scheduledDate + b.scheduledTime))[0];

  const recentTrips = myTrips
    .filter((t) => t.status === TripStatus.COMPLETED)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, 4);

  const pendingCount = myRequests.filter((r) => r.status === "pending").length;

  if (!employee) {
    return <EmptyState title="Select a demo employee to continue" />;
  }

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${employee.name.split(" ")[0]}`}
        description="Here's your upcoming business travel."
        actions={
          <Link to="/employee/request">
            <Button>
              <PlusCircle size={16} />
              Request Ride
            </Button>
          </Link>
        }
      />

      {activeTrip && activeTripDetails?.route && activeTripDetails.pickup && activeTripDetails.destination && (
        <Card className="mb-5 overflow-hidden">
          <CardHeader
            title="Active Trip"
            description={`${activeTripDetails.pickup.name} to ${activeTripDetails.destination.name}`}
            action={<StatusBadge meta={TRIP_STATUS_META[activeTrip.status]} />}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="h-72 lg:col-span-2 lg:h-96">
              <LiveTripMap
                route={activeTripDetails.route}
                pickup={activeTripDetails.pickup}
                destination={activeTripDetails.destination}
                vehiclePosition={activeTrip.currentPosition}
                vehicleLabel={activeTripDetails.driver?.name ?? "Driver"}
                progress={activeTrip.progress}
              />
            </div>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={activeTripDetails.driver?.name ?? "?"}
                  color={activeTripDetails.driver?.avatarColor}
                />
                <div>
                  <p className="text-sm font-semibold text-ink-900">{activeTripDetails.driver?.name}</p>
                  <p className="text-xs text-ink-500">{activeTripDetails.driver?.vehicle.model}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-ink-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-ink-500">ETA</p>
                  <p className="font-semibold text-ink-900">{activeTrip.etaMinutes} min</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Progress</p>
                  <p className="font-semibold text-ink-900">{Math.round(activeTrip.progress)}%</p>
                </div>
              </div>
              <Link
                to={`/live-trip/${activeTrip.id}`}
                className="block text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Open full live trip view &rarr;
              </Link>
            </CardBody>
          </div>
          <div className="border-t border-ink-100 px-5 py-4">
            <SimulationControls tripId={activeTrip.id} tripStatus={activeTrip.status} />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming Trip"
            description={pendingCount > 0 ? `${pendingCount} request(s) pending admin approval` : undefined}
          />
          <CardBody>
            {upcomingTrip ? (
              <UpcomingTripRow tripId={upcomingTrip.id} />
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming trips"
                description="Submit a ride request at least one day before you plan to travel."
                action={
                  <Link to="/employee/request">
                    <Button size="sm">
                      <PlusCircle size={14} />
                      Request Ride
                    </Button>
                  </Link>
                }
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent Trips" />
          <CardBody className="space-y-3">
            {recentTrips.length === 0 ? (
              <EmptyState icon={History} title="No completed trips yet" className="border-none py-6" />
            ) : (
              recentTrips.map((trip) => {
                const destination = getLocationById(trip.destinationLocationId);
                return (
                  <div key={trip.id} className="flex items-center justify-between gap-2 border-b border-ink-100 pb-3 last:border-none last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">{destination?.name}</p>
                      <p className="text-xs text-ink-500">{formatDateLong(trip.scheduledDate)}</p>
                    </div>
                    <StatusBadge meta={TRIP_STATUS_META[trip.status]} />
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function UpcomingTripRow({ tripId }: { tripId: string }) {
  const { state } = useAppState();
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return null;
  const pickup = getLocationById(trip.pickupLocationId);
  const destination = getLocationById(trip.destinationLocationId);
  const driver = getDriverById(trip.driverId);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <MapPin size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-900">
            {pickup?.name} &rarr; {destination?.name}
          </p>
          <p className="text-sm text-ink-500">
            {formatDateLong(trip.scheduledDate)} at {formatTime12h(trip.scheduledTime)}
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Driver: {driver?.name} &middot; {driver?.vehicle.model}
          </p>
        </div>
      </div>
      <StatusBadge meta={RIDE_REQUEST_STATUS_META.assigned} />
    </div>
  );
}
