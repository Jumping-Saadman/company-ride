import { useAppActions } from "../../state/AppStateContext";
import { useToast } from "../../state/ToastContext";
import { TRIP_STATUS_ACTION_LABEL, TRIP_STATUS_META, nextTripStatus } from "../../data/constants";
import { Button } from "../ui/Button";
import { Trip, TripStatus } from "../../types";

export function DriverTripActions({ trip }: { trip: Trip }) {
  const { advanceTripStatus } = useAppActions();
  const { showToast } = useToast();

  if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
    return null;
  }

  const label = TRIP_STATUS_ACTION_LABEL[trip.status];
  if (!label) return null;

  const isCompleting = trip.status === TripStatus.IN_PROGRESS;
  const upcoming = nextTripStatus(trip.status);

  return (
    <Button
      variant={isCompleting ? "primary" : "secondary"}
      onClick={() => {
        advanceTripStatus(trip.id);
        showToast({
          variant: "success",
          title: isCompleting
            ? "Trip completed"
            : `Status updated: ${upcoming ? TRIP_STATUS_META[upcoming].label : ""}`,
        });
      }}
    >
      {label}
    </Button>
  );
}
