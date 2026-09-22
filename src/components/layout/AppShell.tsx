import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { DemoUserMenu } from "../navigation/DemoUserMenu";
import { useAppState } from "../../state/AppStateContext";
import { COMPANY_NAME } from "../../data/constants";

export function AppShell() {
  const { state } = useAppState();
  const role = state.currentUser.role;

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <MobileNav role={role} />
            <span className="text-sm font-semibold text-ink-900 lg:hidden">
              {COMPANY_NAME}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <DemoUserMenu />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
