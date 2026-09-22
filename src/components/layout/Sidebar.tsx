import { NavLink } from "react-router-dom";
import { Building2 } from "lucide-react";
import { NAV_ITEMS } from "../navigation/navConfig";
import { COMPANY_NAME } from "../../data/constants";
import { UserRole } from "../../types";

export function Sidebar({ role }: { role: UserRole }) {
  const items = NAV_ITEMS[role];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-200 bg-white lg:flex">
      <div className="flex items-center gap-2.5 border-b border-ink-100 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
          <Building2 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-ink-900">{COMPANY_NAME}</p>
          <p className="text-xs leading-tight text-ink-500">Ride Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-100 px-4 py-3">
        <span className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Demo Mode
        </span>
      </div>
    </aside>
  );
}
