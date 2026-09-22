import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  Radio,
  Route,
  Users,
  UserCog,
  BarChart3,
  Settings,
  PlusCircle,
  Car,
  Bell,
  User,
  History,
} from "lucide-react";
import { UserRole } from "../../types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
    { label: "Ride Requests", to: "/admin/requests", icon: ClipboardList },
    { label: "Live Trips", to: "/admin/live", icon: Radio },
    { label: "Trips", to: "/trips", icon: Route },
    { label: "Drivers", to: "/admin/drivers", icon: Car },
    { label: "Employees", to: "/admin/employees", icon: Users },
    { label: "Reports", to: "/admin/reports", icon: BarChart3 },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ],
  employee: [
    { label: "Dashboard", to: "/employee", icon: LayoutDashboard, end: true },
    { label: "Request Ride", to: "/employee/request", icon: PlusCircle },
    { label: "My Trips", to: "/trips", icon: Route },
    { label: "Notifications", to: "/employee/notifications", icon: Bell },
    { label: "Profile", to: "/employee/profile", icon: User },
  ],
  driver: [
    { label: "Dashboard", to: "/driver", icon: LayoutDashboard, end: true },
    { label: "Today's Trips", to: "/driver/schedule", icon: ClipboardList },
    { label: "Trip History", to: "/trips", icon: History },
    { label: "Notifications", to: "/driver/notifications", icon: Bell },
    { label: "Profile", to: "/driver/profile", icon: UserCog },
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Transport Administrator",
  employee: "Employee",
  driver: "Driver",
};
