import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, CircleCheck } from "lucide-react";
import { useCurrentEmployee } from "../../hooks/useCurrentActor";
import { useAppActions, useAppState } from "../../state/AppStateContext";
import { useToast } from "../../state/ToastContext";
import { LOCATIONS } from "../../data/locations";
import { getRouteBetween } from "../../data/routes";
import { MIN_LEAD_DAYS_FOR_REQUEST } from "../../data/constants";
import { formatDateLong, formatTime12h, isDateAtLeastLeadDays, minLeadDate } from "../../lib/date";
import { generateNextRequestId } from "../../lib/idGen";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FieldWrapper, Input, Select, Textarea } from "../../components/ui/FormField";
import { RoutePreviewMap } from "../../components/map/RoutePreviewMap";
import { NewRideRequestInput } from "../../state/types";

const STEPS = ["Trip Details", "Review", "Confirmation"];

const initialForm: NewRideRequestInput = {
  employeeId: "",
  travelDate: "",
  departureTime: "",
  pickupLocationId: LOCATIONS[0].id,
  destinationLocationId: LOCATIONS[1].id,
  purpose: "",
  passengerCount: 1,
  notes: "",
};

export default function RequestRide() {
  const employee = useCurrentEmployee();
  const { submitRideRequest } = useAppActions();
  const { state } = useAppState();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<NewRideRequestInput>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const update = <K extends keyof NewRideRequestInput>(key: K, value: NewRideRequestInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  function validateStep1(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!form.travelDate) nextErrors.travelDate = "Travel date is required.";
    else if (!isDateAtLeastLeadDays(form.travelDate, MIN_LEAD_DAYS_FOR_REQUEST)) {
      nextErrors.travelDate = `Rides must be requested at least ${MIN_LEAD_DAYS_FOR_REQUEST} day before travel.`;
    }
    if (!form.departureTime) nextErrors.departureTime = "Departure time is required.";
    if (form.pickupLocationId === form.destinationLocationId) {
      nextErrors.destinationLocationId = "Pickup and destination must be different.";
    }
    if (!form.purpose.trim()) nextErrors.purpose = "Business purpose is required.";
    if (form.passengerCount < 1) nextErrors.passengerCount = "At least 1 passenger is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleSubmit = () => {
    if (!employee) return;
    const generatedId = generateNextRequestId(state.rideRequests.map((r) => r.id));
    submitRideRequest({ ...form, employeeId: employee.id });
    setSubmittedId(generatedId);
    setStep(2);
    showToast({ variant: "success", title: "Ride request submitted successfully." });
  };

  const pickup = LOCATIONS.find((l) => l.id === form.pickupLocationId);
  const destination = LOCATIONS.find((l) => l.id === form.destinationLocationId);
  const route = getRouteBetween(form.pickupLocationId, form.destinationLocationId);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Request a Ride"
        breadcrumbs={[{ label: "Dashboard", to: "/employee" }, { label: "Request Ride" }]}
      />

      <div className="mb-6 flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  i < step
                    ? "bg-emerald-500 text-white"
                    : i === step
                      ? "bg-brand-600 text-white"
                      : "bg-ink-100 text-ink-400"
                }`}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className={`hidden text-sm font-medium sm:block ${i === step ? "text-ink-900" : "text-ink-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="mx-3 h-px flex-1 bg-ink-200" />}
          </div>
        ))}
      </div>

      <Card>
        <CardBody>
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldWrapper
                  label="Travel Date"
                  htmlFor="travelDate"
                  required
                  error={errors.travelDate}
                  hint={!errors.travelDate ? `Earliest selectable date: ${formatDateLong(minLeadDate(MIN_LEAD_DAYS_FOR_REQUEST))}` : undefined}
                >
                  <Input
                    id="travelDate"
                    type="date"
                    min={minLeadDate(MIN_LEAD_DAYS_FOR_REQUEST)}
                    value={form.travelDate}
                    error={!!errors.travelDate}
                    onChange={(e) => update("travelDate", e.target.value)}
                  />
                </FieldWrapper>
                <FieldWrapper label="Departure Time" htmlFor="departureTime" required error={errors.departureTime}>
                  <Input
                    id="departureTime"
                    type="time"
                    value={form.departureTime}
                    error={!!errors.departureTime}
                    onChange={(e) => update("departureTime", e.target.value)}
                  />
                </FieldWrapper>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldWrapper label="Pickup Location" htmlFor="pickup" required>
                  <Select
                    id="pickup"
                    value={form.pickupLocationId}
                    onChange={(e) => update("pickupLocationId", e.target.value)}
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </Select>
                </FieldWrapper>
                <FieldWrapper
                  label="Destination"
                  htmlFor="destination"
                  required
                  error={errors.destinationLocationId}
                >
                  <Select
                    id="destination"
                    value={form.destinationLocationId}
                    error={!!errors.destinationLocationId}
                    onChange={(e) => update("destinationLocationId", e.target.value)}
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </Select>
                </FieldWrapper>
              </div>

              <FieldWrapper label="Business Purpose" htmlFor="purpose" required error={errors.purpose}>
                <Input
                  id="purpose"
                  placeholder="e.g. Client review meeting"
                  value={form.purpose}
                  error={!!errors.purpose}
                  onChange={(e) => update("purpose", e.target.value)}
                />
              </FieldWrapper>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldWrapper label="Passenger Count" htmlFor="passengers" required error={errors.passengerCount}>
                  <Input
                    id="passengers"
                    type="number"
                    min={1}
                    max={8}
                    value={form.passengerCount}
                    error={!!errors.passengerCount}
                    onChange={(e) => update("passengerCount", Number(e.target.value))}
                  />
                </FieldWrapper>
              </div>

              <FieldWrapper label="Additional Notes" htmlFor="notes" hint="Optional">
                <Textarea
                  id="notes"
                  placeholder="Any special requirements for this trip"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </FieldWrapper>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-1">
              {pickup && destination && (
                <div className="mb-4 overflow-hidden rounded-lg border border-ink-200">
                  <RoutePreviewMap route={route} pickup={pickup} destination={destination} />
                </div>
              )}
              <ReviewRow label="Travel Date" value={formatDateLong(form.travelDate)} />
              <ReviewRow label="Departure Time" value={formatTime12h(form.departureTime)} />
              <ReviewRow label="Pickup" value={pickup?.name ?? "-"} />
              <ReviewRow label="Destination" value={destination?.name ?? "-"} />
              <ReviewRow label="Purpose" value={form.purpose} />
              <ReviewRow label="Passengers" value={String(form.passengerCount)} />
              <ReviewRow label="Notes" value={form.notes || "-"} />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CircleCheck size={28} />
              </div>
              <p className="text-lg font-semibold text-ink-900">Ride request submitted successfully.</p>
              <p className="mt-1 text-sm text-ink-500">
                Reference ID: <span className="font-mono font-medium text-ink-700">{submittedId}</span>
              </p>
              <p className="mt-3 max-w-sm text-sm text-ink-500">
                Your transport administrator will review this request and assign a driver shortly. You'll be notified once it's approved.
              </p>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => navigate("/employee")}>
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => {
                    setForm(initialForm);
                    setSubmittedId(null);
                    setStep(0);
                  }}
                >
                  Submit Another
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {step < 2 && (
        <div className="mt-5 flex justify-between">
          <Button
            variant="outline"
            onClick={() => (step === 0 ? navigate("/employee") : setStep((s) => s - 1))}
          >
            <ChevronLeft size={16} />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step === 0 ? (
            <Button onClick={handleNext}>
              Review
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Submit Request</Button>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-2.5 last:border-none">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-ink-900">{value}</span>
    </div>
  );
}
