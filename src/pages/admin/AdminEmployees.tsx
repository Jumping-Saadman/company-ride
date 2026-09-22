import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppState } from "../../state/AppStateContext";
import { EMPLOYEE_STATUS_META } from "../../data/constants";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { StatusBadge } from "../../components/ui/Badge";
import { Input, Select } from "../../components/ui/FormField";
import { EmptyState } from "../../components/ui/EmptyState";
import { EmployeeStatus } from "../../types";

export default function AdminEmployees() {
  const { state } = useAppState();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");

  const departments = useMemo(
    () => Array.from(new Set(state.employees.map((e) => e.department))).sort(),
    [state.employees],
  );

  const filtered = state.employees.filter((e) => {
    if (department !== "all" && e.department !== department) return false;
    if (status !== "all" && e.status !== status) return false;
    if (search.trim() && !`${e.name} ${e.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Company employee directory and travel activity."
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Employees" }]}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="sm:w-48">
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-40">
          <option value="all">All Statuses</option>
          <option value={EmployeeStatus.ACTIVE}>Active</option>
          <option value={EmployeeStatus.INACTIVE}>Inactive</option>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No employees match your filters" className="border-none py-14" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Trips</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const tripCount = state.trips.filter((t) => t.employeeId === e.id).length;
                  return (
                    <tr key={e.id} className="border-b border-ink-50 last:border-none">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={e.name} color={e.avatarColor} size="sm" />
                          <div>
                            <p className="font-medium text-ink-900">{e.name}</p>
                            <p className="text-xs text-ink-500">{e.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">{e.department}</td>
                      <td className="px-5 py-3.5 text-ink-600">
                        <p>{e.email}</p>
                        <p className="text-xs text-ink-400">{e.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">{tripCount}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge meta={EMPLOYEE_STATUS_META[e.status]} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
