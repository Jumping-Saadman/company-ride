import { useMemo, useState } from "react";
import { Search, ClipboardList } from "lucide-react";
import { useAppState, useAppActions } from "../../state/AppStateContext";
import { useToast } from "../../state/ToastContext";
import { getLocationById } from "../../data/locations";
import { RIDE_REQUEST_STATUS_META } from "../../data/constants";
import { formatDateLong, formatTime12h } from "../../lib/date";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/FormField";
import { StatusBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { RequestDetailDrawer } from "../../components/requests/RequestDetailDrawer";
import { DriverAssignmentModal } from "../../components/drivers/DriverAssignmentModal";
import { RideRequestStatus } from "../../types";

export default function AdminRequests() {
  const { state } = useAppState();
  const actions = useAppActions();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return state.rideRequests
      .filter((r) => (statusFilter === "all" ? true : r.status === statusFilter))
      .filter((r) => (employeeFilter === "all" ? true : r.employeeId === employeeFilter))
      .filter((r) => {
        if (!search.trim()) return true;
        const employee = state.employees.find((e) => e.id === r.employeeId);
        const haystack = `${r.id} ${employee?.name ?? ""} ${r.purpose}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.rideRequests, state.employees, search, statusFilter, employeeFilter]);

  const selectedRequest = state.rideRequests.find((r) => r.id === selectedId) ?? null;
  const selectedEmployee = selectedRequest
    ? state.employees.find((e) => e.id === selectedRequest.employeeId)
    : undefined;

  return (
    <div>
      <PageHeader
        title="Ride Requests"
        description="Review, approve, and assign drivers to employee ride requests."
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Ride Requests" }]}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search by ID, employee, or purpose"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
          <option value="all">All Statuses</option>
          {Object.values(RideRequestStatus).map((s) => (
            <option key={s} value={s}>
              {RIDE_REQUEST_STATUS_META[s].label}
            </option>
          ))}
        </Select>
        <Select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="sm:w-48">
          <option value="all">All Employees</option>
          {state.employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </Select>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No ride requests match your filters"
            className="border-none py-14"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Request</th>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Purpose</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const employee = state.employees.find((e) => e.id === r.employeeId);
                  const pickup = getLocationById(r.pickupLocationId);
                  const destination = getLocationById(r.destinationLocationId);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className="cursor-pointer border-b border-ink-50 last:border-none hover:bg-ink-50"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-ink-600">{r.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink-900">{employee?.name}</p>
                        <p className="text-xs text-ink-500">{employee?.department}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-700">
                        {formatDateLong(r.travelDate)}
                        <p className="text-xs text-ink-400">{formatTime12h(r.departureTime)}</p>
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">
                        {pickup?.name} &rarr; {destination?.name}
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-3.5 text-ink-600">{r.purpose}</td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <StatusBadge meta={RIDE_REQUEST_STATUS_META[r.status]} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <RequestDetailDrawer
        request={selectedRequest}
        employee={selectedEmployee}
        onClose={() => setSelectedId(null)}
        onApprove={() => {
          if (selectedRequest) actions.approveRequest(selectedRequest.id);
          showToast({ variant: "success", title: "Request approved" });
        }}
        onReject={() => {
          if (selectedRequest) actions.rejectRequest(selectedRequest.id);
          showToast({ variant: "warning", title: "Request rejected" });
          setSelectedId(null);
        }}
        onAssign={() => setAssignModalOpen(true)}
        onCancel={() => {
          if (selectedRequest) actions.cancelRequest(selectedRequest.id);
          showToast({ variant: "warning", title: "Request cancelled" });
          setSelectedId(null);
        }}
      />

      <DriverAssignmentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={(driverId) => {
          if (selectedRequest) {
            actions.assignDriver(selectedRequest.id, driverId);
            showToast({ variant: "success", title: "Driver assigned successfully" });
          }
          setAssignModalOpen(false);
          setSelectedId(null);
        }}
      />
    </div>
  );
}
