import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useMyNotifications } from "../../hooks/useNotifications";
import { useAppActions } from "../../state/AppStateContext";
import { formatRelativeTime } from "../../lib/date";
import { EmptyState } from "../ui/EmptyState";
import { DropdownPanel } from "../ui/DropdownPanel";

export function NotificationCenter() {
  const { notifications, unreadCount, audience, recipientId } = useMyNotifications();
  const actions = useAppActions();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow-sm">
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-red-400 opacity-75" />
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <DropdownPanel
        open={open}
        className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-ink-200 bg-white shadow-xl sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <p className="text-sm font-semibold text-ink-900">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={() => actions.markAllNotificationsRead(audience, recipientId)}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="You'll see updates here as things happen."
              className="border-none py-8"
            />
          ) : (
            notifications.slice(0, 20).map((n) => (
              <button
                key={n.id}
                onClick={() => actions.markNotificationRead(n.id)}
                className={`flex w-full items-start gap-2 border-b border-ink-50 px-4 py-3 text-left transition-colors hover:bg-ink-50 ${
                  !n.read ? "bg-brand-50/40" : ""
                }`}
              >
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    n.read ? "bg-transparent" : "bg-brand-500"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink-800">{n.title}</span>
                  <span className="mt-0.5 block text-sm text-ink-500">{n.message}</span>
                  <span className="mt-1 block text-xs text-ink-400">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </DropdownPanel>
    </div>
  );
}
