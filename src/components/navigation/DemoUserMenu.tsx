import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  RefreshCcw,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useAppActions, useAppState } from "../../state/AppStateContext";
import { useToast } from "../../state/ToastContext";
import { Avatar } from "../ui/Avatar";
import { ROLE_LABELS } from "./navConfig";
import { UserRole } from "../../types";
import { useCurrentDriver, useCurrentEmployee } from "../../hooks/useCurrentActor";

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  employee: "/employee",
  driver: "/driver",
};

const ROLES: UserRole[] = ["admin", "employee", "driver"];

export function DemoUserMenu() {
  const { state } = useAppState();
  const actions = useAppActions();
  const { showToast } = useToast();
  const employee = useCurrentEmployee();
  const driver = useCurrentDriver();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const currentName =
    state.currentUser.role === "admin"
      ? "Sarah Rahman"
      : state.currentUser.role === "employee"
        ? employee?.name ?? "Select employee"
        : driver?.name ?? "Select driver";

  const currentColor =
    state.currentUser.role === "employee"
      ? employee?.avatarColor
      : state.currentUser.role === "driver"
        ? driver?.avatarColor
        : "#1e3a8a";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-2 py-1.5 hover:bg-ink-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={currentName} color={currentColor} size="sm" />
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-tight text-ink-900">{currentName}</p>
          <p className="text-xs leading-tight text-ink-500">
            {ROLE_LABELS[state.currentUser.role]}
          </p>
        </div>
        <ChevronDown size={16} className="text-ink-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-ink-200 bg-white p-3 shadow-xl"
        >
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Switch Demo Role
          </p>
          <div className="grid grid-cols-3 gap-1.5 pb-3">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => {
                  actions.switchUser(
                    role === "employee"
                      ? { role, employeeId: state.currentUser.employeeId ?? state.employees[0].id }
                      : role === "driver"
                        ? { role, driverId: state.currentUser.driverId ?? state.drivers[0].id }
                        : { role },
                  );
                  navigate(ROLE_HOME[role]);
                  if (role !== "employee" && role !== "driver") setOpen(false);
                }}
                className={`rounded-lg border px-2 py-2 text-xs font-medium capitalize transition-colors ${
                  state.currentUser.role === role
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-ink-200 text-ink-600 hover:bg-ink-50"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {state.currentUser.role === "employee" && (
            <div className="mb-3">
              <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Demo Employee
              </p>
              <div className="max-h-48 space-y-0.5 overflow-y-auto">
                {state.employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      actions.switchUser({ role: "employee", employeeId: emp.id });
                      navigate(ROLE_HOME.employee);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-ink-50 ${
                      state.currentUser.employeeId === emp.id ? "bg-brand-50" : ""
                    }`}
                  >
                    <Avatar name={emp.name} color={emp.avatarColor} size="sm" />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="block truncate font-medium text-ink-800">{emp.name}</span>
                      <span className="block truncate text-xs text-ink-500">{emp.position}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.currentUser.role === "driver" && (
            <div className="mb-3">
              <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Demo Driver
              </p>
              <div className="max-h-48 space-y-0.5 overflow-y-auto">
                {state.drivers.map((drv) => (
                  <button
                    key={drv.id}
                    onClick={() => {
                      actions.switchUser({ role: "driver", driverId: drv.id });
                      navigate(ROLE_HOME.driver);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-ink-50 ${
                      state.currentUser.driverId === drv.id ? "bg-brand-50" : ""
                    }`}
                  >
                    <Avatar name={drv.name} color={drv.avatarColor} size="sm" />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="block truncate font-medium text-ink-800">{drv.name}</span>
                      <span className="block truncate text-xs text-ink-500">{drv.vehicle.model}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-ink-100 pt-3">
            <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Demo Controls
            </p>
            <div className="space-y-1">
              <DemoControlButton
                icon={Sparkles}
                label="Simulate New Request"
                onClick={() => {
                  actions.simulateNewRequest();
                  showToast({ variant: "info", title: "Simulated a new ride request" });
                }}
              />
              <DemoControlButton
                icon={PlayCircle}
                label="Start Sample Trip"
                onClick={() => {
                  actions.startSampleTrip();
                  showToast({ variant: "success", title: "Sample trip started" });
                }}
              />
              <DemoControlButton
                icon={CheckCircle2}
                label="Complete Sample Trip"
                onClick={() => {
                  actions.completeSampleTrip();
                  showToast({ variant: "success", title: "Sample trip completed" });
                }}
              />
              <DemoControlButton
                icon={Users}
                label="Switch Demo User"
                onClick={() => setOpen(true)}
              />
              <DemoControlButton
                icon={RefreshCcw}
                label="Reset Demo Data"
                danger
                onClick={() => {
                  if (confirm("Reset all demo data to its original seed state?")) {
                    actions.resetDemoData();
                    showToast({ variant: "warning", title: "Demo data has been reset" });
                    setOpen(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DemoControlButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Sparkles;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-ink-50 ${
        danger ? "text-red-600" : "text-ink-700"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}
