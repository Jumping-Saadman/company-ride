import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Building2 } from "lucide-react";
import { NAV_ITEMS } from "../navigation/navConfig";
import { COMPANY_NAME } from "../../data/constants";
import { UserRole } from "../../types";

export function MobileNav({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);
  const items = NAV_ITEMS[role];

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="rounded-lg p-2 text-ink-600 hover:bg-ink-100"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                  <Building2 size={16} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-ink-900">{COMPANY_NAME}</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-600 hover:bg-ink-100"
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
          </div>
        </div>
      )}
    </div>
  );
}
