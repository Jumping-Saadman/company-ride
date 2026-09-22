import { useEffect, useState } from "react";
import { Drawer } from "../ui/Drawer";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/Badge";
import { RIDE_REQUEST_STATUS_META } from "../../data/constants";
import { getLocationById } from "../../data/locations";
import { getRouteBetween } from "../../data/routes";
import { formatDateLong, formatTime12h } from "../../lib/date";
import { RideRequest, RideRequestStatus, Employee } from "../../types";
import { RoutePreviewMap } from "../map/RoutePreviewMap";

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
  // Keep the last non-null request rendered while the drawer plays its
  // close animation, instead of unmounting the content abruptly.
  const [displayed, setDisplayed] = useState(request);
  useEffect(() => {
    if (request) setDisplayed(request);
  }, [request]);

  if (!displayed) return null;

  const pickup = getLocationById(displayed.pickupLocationId);
  const destination = getLocationById(displayed.destinationLocationId);
  const route = getRouteBetween(displayed.pickupLocationId, displayed.destinationLocationId);

  const canApprove = displayed.status === RideRequestStatus.PENDING;
  const canReject = displayed.status === RideRequestStatus.PENDING;
  const canAssign =
    displayed.status === RideRequestStatus.APPROVED || displayed.status === RideRequestStatus.PENDING;
  const canCancel =
    displayed.status === RideRequestStatus.PENDING || displayed.status === RideRequestStatus.APPROVED;

  return (
    <Drawer
      open={!!request}
      onClose={onClose}
      title={displayed.id}
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
        <StatusBadge meta={RIDE_REQUEST_STATUS_META[displayed.status]} />
      </div>

      {pickup && destination && (
        <div className="mb-4 overflow-hidden rounded-lg border border-ink-200">
          <RoutePreviewMap route={route} pickup={pickup} destination={destination} />
        </div>
      )}

      <Row label="Requested Date" value={formatDateLong(displayed.travelDate)} />
      <Row label="Requested Time" value={formatTime12h(displayed.departureTime)} />
      <Row label="Pickup" value={pickup?.name ?? "-"} />
      <Row label="Destination" value={destination?.name ?? "-"} />
      <Row label="Purpose" value={displayed.purpose} />
      <Row label="Passengers" value={String(displayed.passengerCount)} />
      <Row label="Notes" value={displayed.notes || "-"} />
    </Drawer>
  );
}
