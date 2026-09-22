import { Phone, Car as CarIcon } from "lucide-react";
import { useAppState, useAppActions } from "../../state/AppStateContext";
import { useToast } from "../../state/ToastContext";
import { DRIVER_STATUS_META } from "../../data/constants";
import { todayISODate } from "../../lib/date";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DriverStatus } from "../../types";

export default function AdminDrivers() {
  const { state } = useAppState();
  const { setDriverStatus: setDriverStatusAction } = useAppActions();
  const { showToast } = useToast();
  const today = todayISODate();

  const setDriverStatus = (driverId: string, status: DriverStatus) => {
    const driver = state.drivers.find((d) => d.id === driverId);
    setDriverStatusAction(driverId, status);
    showToast({ variant: "info", title: `${driver?.name} marked ${DRIVER_STATUS_META[status].label.toLowerCase()}` });
  };

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="Manage your company driver roster."
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Drivers" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.drivers.map((driver) => {
          const todaysTrips = state.trips.filter((t) => t.driverId === driver.id && t.scheduledDate === today).length;
          const totalTrips = state.trips.filter((t) => t.driverId === driver.id).length;

          return (
            <Card key={driver.id} className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={driver.name} seed={driver.id} color={driver.avatarColor} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{driver.name}</p>
                    <p className="text-xs text-ink-500">{driver.vehicle.model}</p>
                  </div>
                </div>
                <StatusBadge meta={DRIVER_STATUS_META[driver.status]} />
              </div>
              <div className="space-y-1.5 border-t border-ink-100 pt-3 text-sm">
                <div className="flex items-center gap-2 text-ink-500">
                  <Phone size={13} /> {driver.phone}
                </div>
                <div className="flex items-center gap-2 text-ink-500">
                  <CarIcon size={13} /> {driver.vehicle.plate}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-ink-50 p-2.5 text-center">
                <div>
                  <p className="text-xs text-ink-500">Today</p>
                  <p className="text-sm font-semibold text-ink-900">{todaysTrips}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Total</p>
                  <p className="text-sm font-semibold text-ink-900">{totalTrips}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {driver.status === DriverStatus.OFFLINE ? (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setDriverStatus(driver.id, DriverStatus.AVAILABLE)}>
                    Activate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={driver.status === DriverStatus.ON_TRIP}
                    onClick={() => setDriverStatus(driver.id, DriverStatus.OFFLINE)}
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
