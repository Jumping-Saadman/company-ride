import { Drawer } from "../ui/Drawer";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/Badge";
import { RIDE_REQUEST_STATUS_META } from "../../data/constants";
import { getLocationById } from "../../data/locations";
import { formatDateLong, formatTime12h } from "../../lib/date";
import { RideRequest, RideRequestStatus, Employee } from "../../types";

interface RequestDetailDrawerProps {
  request: RideRequest | null;
  employee?: Employee;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onAssign: () => void;
  onCancel: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-100 py-3 last:border-none">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium text-ink-900">{value}</span>
    </div>
  );
}

export function RequestDetailDrawer({
  request,
  employee,
  onClose,
  onApprove,
  onReject,
  onAssign,
  onCancel,
}: RequestDetailDrawerProps) {
  if (!request) return null;

  const pickup = getLocationById(request.pickupLocationId);
  const destination = getLocationById(request.destinationLocationId);

  const canApprove = request.status === RideRequestStatus.PENDING;
  const canReject = request.status === RideRequestStatus.PENDING;
  const canAssign =
    request.status === RideRequestStatus.APPROVED || request.status === RideRequestStatus.PENDING;
  const canCancel =
    request.status === RideRequestStatus.PENDING || request.status === RideRequestStatus.APPROVED;

  return (
    <Drawer
      open={!!request}
      onClose={onClose}
      title={request.id}
      footer={
        <div className="flex flex-wrap gap-2">
          {canApprove && (
            <Button size="sm" onClick={onApprove}>
              Approve
            </Button>
          )}
          {canAssign && (
            <Button size="sm" variant="secondary" onClick={onAssign}>
              Assign Driver
            </Button>
          )}
          {canReject && (
            <Button size="sm" variant="danger" onClick={onReject}>
              Reject
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-900">{employee?.name}</p>
          <p className="text-xs text-ink-500">{employee?.department}</p>
        </div>
        <StatusBadge meta={RIDE_REQUEST_STATUS_META[request.status]} />
      </div>

      <Row label="Requested Date" value={formatDateLong(request.travelDate)} />
      <Row label="Requested Time" value={formatTime12h(request.departureTime)} />
      <Row label="Pickup" value={pickup?.name ?? "-"} />
      <Row label="Destination" value={destination?.name ?? "-"} />
      <Row label="Purpose" value={request.purpose} />
      <Row label="Passengers" value={String(request.passengerCount)} />
      <Row label="Notes" value={request.notes || "-"} />
    </Drawer>
  );
}
