import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { StatusBadge } from "../ui/Badge";
import { DRIVER_STATUS_META } from "../../data/constants";
import { useAppState } from "../../state/AppStateContext";
import { Driver, DriverStatus } from "../../types";
import { todayISODate } from "../../lib/date";

interface DriverAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (driverId: string) => void;
}

export function DriverAssignmentModal({ open, onClose, onAssign }: DriverAssignmentModalProps) {
  const { state } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);
  const today = todayISODate();

  const drivers = [...state.drivers].sort((a, b) => {
    if (a.status === b.status) return a.name.localeCompare(b.name);
    return a.status === DriverStatus.AVAILABLE ? -1 : 1;
  });

  const tripsToday = (driverId: string) =>
    state.trips.filter((t) => t.driverId === driverId && t.scheduledDate === today).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Driver"
      maxWidth="max-w-xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!selected}
            onClick={() => {
              if (selected) onAssign(selected);
            }}
          >
            Confirm Assignment
          </Button>
        </div>
      }
    >
      <div className="space-y-2">
        {drivers.map((driver: Driver) => (
          <button
            key={driver.id}
            onClick={() => setSelected(driver.id)}
            disabled={driver.status === DriverStatus.OFFLINE}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              selected === driver.id
                ? "border-brand-500 bg-brand-50"
                : "border-ink-200 hover:bg-ink-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar name={driver.name} color={driver.avatarColor} />
              <div>
                <p className="text-sm font-semibold text-ink-900">{driver.name}</p>
                <p className="text-xs text-ink-500">
                  {driver.vehicle.model} &middot; {driver.vehicle.plate}
                </p>
                <p className="text-xs text-ink-400">{tripsToday(driver.id)} trip(s) today</p>
              </div>
            </div>
            <StatusBadge meta={DRIVER_STATUS_META[driver.status]} />
          </button>
        ))}
      </div>
    </Modal>
  );
}
