import { Mail, Phone, Building2, Car, IdCard } from "lucide-react";
import { useAppState } from "../state/AppStateContext";
import { useCurrentDriver, useCurrentEmployee } from "../hooks/useCurrentActor";
import { ROLE_LABELS } from "../components/navigation/navConfig";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardBody } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { StatusBadge } from "../components/ui/Badge";
import { EMPLOYEE_STATUS_META, DRIVER_STATUS_META } from "../data/constants";

export default function ProfilePage() {
  const { state } = useAppState();
  const role = state.currentUser.role;
  const employee = useCurrentEmployee();
  const driver = useCurrentDriver();

  const name = role === "admin" ? "Sarah Rahman" : role === "employee" ? employee?.name : driver?.name;
  const color = role === "admin" ? "#1e3a8a" : role === "employee" ? employee?.avatarColor : driver?.avatarColor;
  const email = role === "admin" ? "admin@nexacore.demo" : employee?.email;
  const phone = role === "admin" ? "+880 1711-000000" : employee?.phone ?? driver?.phone;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Profile" />
      <Card>
        <CardBody>
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={name ?? "?"} color={color} size="lg" />
            <div>
              <p className="text-lg font-semibold text-ink-900">{name}</p>
              <p className="text-sm text-ink-500">{ROLE_LABELS[role]}</p>
            </div>
          </div>

          <div className="space-y-1">
            {email && (
              <InfoRow icon={Mail} label="Email" value={email} />
            )}
            {phone && <InfoRow icon={Phone} label="Phone" value={phone} />}
            {role === "employee" && employee && (
              <>
                <InfoRow icon={Building2} label="Department" value={employee.department} />
                <div className="flex items-center justify-between border-b border-ink-100 py-3 last:border-none">
                  <span className="flex items-center gap-2 text-sm text-ink-500">Status</span>
                  <StatusBadge meta={EMPLOYEE_STATUS_META[employee.status]} />
                </div>
              </>
            )}
            {role === "driver" && driver && (
              <>
                <InfoRow icon={Car} label="Vehicle" value={driver.vehicle.model} />
                <InfoRow icon={IdCard} label="License Plate" value={driver.vehicle.plate} />
                <div className="flex items-center justify-between border-b border-ink-100 py-3 last:border-none">
                  <span className="flex items-center gap-2 text-sm text-ink-500">Status</span>
                  <StatusBadge meta={DRIVER_STATUS_META[driver.status]} />
                </div>
              </>
            )}
            {role === "admin" && (
              <InfoRow icon={Building2} label="Department" value="Transport Administration" />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-3 last:border-none">
      <span className="flex items-center gap-2 text-sm text-ink-500">
        <Icon size={15} />
        {label}
      </span>
      <span className="text-sm font-medium text-ink-900">{value}</span>
    </div>
  );
}
