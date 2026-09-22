import { useMemo } from "react";
import { useAppState } from "../state/AppStateContext";
import { AppNotification, NotificationAudience } from "../types";

export function useMyNotifications(): {
  notifications: AppNotification[];
  unreadCount: number;
  audience: NotificationAudience;
  recipientId?: string;
} {
  const { state } = useAppState();
  const { currentUser } = state;

  const audience: NotificationAudience =
    currentUser.role === "admin"
      ? "admin"
      : currentUser.role === "employee"
        ? "employee"
        : "driver";

  const recipientId =
    currentUser.role === "employee"
      ? currentUser.employeeId
      : currentUser.role === "driver"
        ? currentUser.driverId
        : undefined;

  const notifications = useMemo(() => {
    return state.notifications
      .filter((n) => n.audience === audience)
      .filter((n) => !n.recipientId || n.recipientId === recipientId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [state.notifications, audience, recipientId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, audience, recipientId };
}
