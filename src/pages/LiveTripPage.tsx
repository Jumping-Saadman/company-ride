import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTripById } from "../hooks/useTripDetails";
import { useTripSimulation } from "../hooks/useTripSimulation";
import { LiveTripMap } from "../components/map/LiveTripMap";
import { TripInfoPanel } from "../components/trips/TripInfoPanel";
import { TripStatusTimeline } from "../components/trips/TripStatusTimeline";
import { SimulationControls } from "../components/trips/SimulationControls";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/layout/PageHeader";
import { MapPinOff } from "lucide-react";

export default function LiveTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const details = useTripById(tripId);

  useTripSimulation(details?.trip);

  if (!details || !details.route || !details.pickup || !details.destination) {
    return (
      <div>
        <PageHeader title="Live Trip" breadcrumbs={[{ label: "Trips", to: "/trips" }, { label: "Live Trip" }]} />
        <EmptyState
          icon={MapPinOff}
          title="Trip not found"
          description="This trip may have been removed or the link is incorrect."
          action={
            <Link to="/trips" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Back to Trips
            </Link>
          }
        />
      </div>
    );
  }

  const { trip, employee, driver, pickup, destination, route } = details;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/trips"
          className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft size={15} />
          Back
        </Link>
      </div>
      <PageHeader
        title={`Trip ${trip.id}`}
        description={`${pickup.name} to ${destination.name}`}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="h-[380px] w-full sm:h-[480px] lg:h-[560px]">
              <LiveTripMap
                route={route}
                pickup={pickup}
                destination={destination}
                vehiclePosition={trip.currentPosition}
                vehicleLabel={`${driver?.name ?? "Driver"} · ${driver?.vehicle.model ?? ""}`}
                progress={trip.progress}
              />
            </div>
          </Card>
          <div className="mt-5">
            <SimulationControls tripId={trip.id} tripStatus={trip.status} />
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <CardBody>
              <TripInfoPanel
                trip={trip}
                employee={employee}
                driver={driver}
                pickup={pickup}
                destination={destination}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Trip Timeline" />
            <CardBody>
              <TripStatusTimeline timeline={trip.timeline} currentStatus={trip.status} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
