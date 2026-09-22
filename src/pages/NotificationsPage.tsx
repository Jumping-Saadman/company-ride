import { Bell } from "lucide-react";
import { useMyNotifications } from "../hooks/useNotifications";
import { useAppActions } from "../state/AppStateContext";
import { formatRelativeTime } from "../lib/date";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";

export default function NotificationsPage() {
  const { notifications, unreadCount, audience, recipientId } = useMyNotifications();
  const { markAllNotificationsRead, markNotificationRead } = useAppActions();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead(audience, recipientId)}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You'll see updates here as things happen." />
      ) : (
        <Card>
          <div className="divide-y divide-ink-100">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-ink-50 ${!n.read ? "bg-brand-50/30" : ""}`}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-brand-500"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink-900">{n.title}</span>
                  <span className="mt-0.5 block text-sm text-ink-500">{n.message}</span>
                  <span className="mt-1 block text-xs text-ink-400">{formatRelativeTime(n.createdAt)}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
