import { useState } from "react";
import { COMPANY_NAME, MIN_LEAD_DAYS_FOR_REQUEST } from "../../data/constants";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/FormField";

function Toggle({ label, description }: { label: string; description: string }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-3.5 last:border-none">
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={() => setEnabled((v) => !v)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-brand-600" : "bg-ink-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Settings" description="Company, notification, and trip policy configuration." />

      <Card>
        <CardHeader title="Company" />
        <CardBody className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Company Name</label>
            <Input value={COMPANY_NAME} readOnly />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Primary Region</label>
            <Input value="Dhaka, Bangladesh" readOnly />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Notifications" />
        <CardBody>
          <Toggle label="New ride requests" description="Notify admins when employees submit a request" />
          <Toggle label="Trip status updates" description="Notify employees when their trip status changes" />
          <Toggle label="Driver assignments" description="Notify drivers when a new trip is assigned" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Trip Policies" />
        <CardBody>
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Ride requests must be submitted at least {MIN_LEAD_DAYS_FOR_REQUEST} day before travel.
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Appearance" />
        <CardBody>
          <Toggle label="Compact tables" description="Reduce padding in data tables" />
          <Toggle label="Show demo mode banner" description="Display the demo mode indicator in the sidebar" />
        </CardBody>
      </Card>
    </div>
  );
}
