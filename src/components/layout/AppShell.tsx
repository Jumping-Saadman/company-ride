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
    // overflow-x-hidden is a safety net: every child below is meant to
    // respect the viewport on its own, but this guarantees no stray element
    // can ever force the whole page to scroll sideways.
    <div className="min-h-screen w-full overflow-x-hidden bg-surface-subtle">
      <Sidebar role={role} />
      {/* lg:pl-64 reserves the width of the fixed sidebar so content never
          sits underneath it once the sidebar leaves normal flow. */}
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <MobileNav role={role} />
            <span className="truncate text-sm font-semibold text-ink-900 lg:hidden">
              {COMPANY_NAME}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <NotificationCenter />
            <DemoUserMenu />
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
