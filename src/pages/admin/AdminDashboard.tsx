import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  Clock,
  Radio,
  Car,
  ClipboardList,
  UserCog,
  Route,
  BarChart3,
} from "lucide-react";
import { useAppState } from "../../state/AppStateContext";
import { getLocationById } from "../../data/locations";
import { isActiveTripStatus, TRIP_STATUS_META } from "../../data/constants";
import { formatTime12h, todayISODate } from "../../lib/date";
import { PageHeader } from "../../components/layout/PageHeader";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { RideRequestStatus, TripStatus, DriverStatus } from "../../types";

export default function AdminDashboard() {
  const { state } = useAppState();
  const today = todayISODate();

  const tripsToday = state.trips.filter((t) => t.scheduledDate === today).length;
  const pendingRequests = state.rideRequests.filter((r) => r.status === RideRequestStatus.PENDING).length;
  const activeTrips = state.trips.filter((t) => isActiveTripStatus(t.status));
  const availableDrivers = state.drivers.filter((d) => d.status === DriverStatus.AVAILABLE).length;

  const todaysTrips = state.trips
    .filter((t) => t.scheduledDate === today)
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const upcomingTrips = state.trips
    .filter((t) => t.status === TripStatus.SCHEDULED && t.scheduledDate > today)
    .sort((a, b) => (a.scheduledDate + a.scheduledTime).localeCompare(b.scheduledDate + b.scheduledTime))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Fleet overview and today's business travel at a glance."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Trips Today" value={tripsToday} icon={Clock} accent="brand" index={0} />
        <KpiCard label="Pending Requests" value={pendingRequests} icon={ClipboardCheck} accent="amber" index={1} />
        <KpiCard label="Active Trips" value={activeTrips.length} icon={Radio} accent="violet" index={2} />
        <KpiCard label="Available Drivers" value={availableDrivers} icon={Car} accent="emerald" index={3} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Active Trips" description="Trips currently in progress" />
          <CardBody className="p-0">
            {activeTrips.length === 0 ? (
              <EmptyState icon={Radio} title="No active trips right now" className="border-none py-10" />
            ) : (
              <div className="divide-y divide-ink-100">
                {activeTrips.map((trip) => {
                  const employee = state.employees.find((e) => e.id === trip.employeeId);
                  const driver = state.drivers.find((d) => d.id === trip.driverId);
                  const destination = getLocationById(trip.destinationLocationId);
                  return (
                    <div key={trip.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink-900">
                          {employee?.name} &middot; {driver?.name}
                        </p>
                        <p className="text-xs text-ink-500">
                          To {destination?.name} &middot; ETA {trip.etaMinutes} min &middot; {Math.round(trip.progress)}%
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge meta={TRIP_STATUS_META[trip.status]} />
                        <Link
                          to={`/live-trip/${trip.id}`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          View Live Trip
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <CardBody className="space-y-1">
            <QuickAction to="/admin/requests" icon={ClipboardList} label="Review Ride Requests" />
            <QuickAction to="/admin/requests" icon={UserCog} label="Assign Driver" />
            <QuickAction to="/admin/live" icon={Radio} label="View Live Trips" />
            <QuickAction to="/admin/drivers" icon={Car} label="Manage Drivers" />
            <QuickAction to="/trips" icon={Route} label="View Trip History" />
            <QuickAction to="/admin/reports" icon={BarChart3} label="View Reports" />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Today's Trips" />
          <CardBody className="p-0">
            {todaysTrips.length === 0 ? (
              <EmptyState title="No trips scheduled today" className="border-none py-10" />
            ) : (
              <div className="divide-y divide-ink-100">
                {todaysTrips.map((trip) => {
                  const employee = state.employees.find((e) => e.id === trip.employeeId);
                  const driver = state.drivers.find((d) => d.id === trip.driverId);
                  const pickup = getLocationById(trip.pickupLocationId);
                  const destination = getLocationById(trip.destinationLocationId);
                  return (
                    <div key={trip.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{employee?.name}</p>
                        <p className="truncate text-xs text-ink-500">
                          {pickup?.name} &rarr; {destination?.name} &middot; {driver?.name}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-ink-400">{formatTime12h(trip.scheduledTime)}</span>
                        <StatusBadge meta={TRIP_STATUS_META[trip.status]} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Upcoming Trips" />
          <CardBody className="p-0">
            {upcomingTrips.length === 0 ? (
              <EmptyState title="No upcoming trips scheduled" className="border-none py-10" />
            ) : (
              <div className="divide-y divide-ink-100">
                {upcomingTrips.map((trip) => {
                  const employee = state.employees.find((e) => e.id === trip.employeeId);
                  const driver = state.drivers.find((d) => d.id === trip.driverId);
                  const destination = getLocationById(trip.destinationLocationId);
                  return (
                    <div key={trip.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{employee?.name}</p>
                        <p className="truncate text-xs text-ink-500">
                          To {destination?.name} &middot; {driver?.name}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-400">
                        {trip.scheduledDate} &middot; {formatTime12h(trip.scheduledTime)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: typeof ClipboardList; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
        <Icon size={15} />
      </span>
      {label}
    </Link>
  );
}
