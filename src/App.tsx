import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppStateProvider } from "./state/AppStateContext";
import { ToastProvider } from "./state/ToastContext";
import { AppShell } from "./components/layout/AppShell";
import { RoleGuard } from "./components/layout/RoleGuard";

import RootRedirect from "./pages/RootRedirect";
import NotFoundPage from "./pages/NotFoundPage";
import LiveTripPage from "./pages/LiveTripPage";
import TripHistoryPage from "./pages/TripHistoryPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminLiveTrips from "./pages/admin/AdminLiveTrips";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import RequestRide from "./pages/employee/RequestRide";

import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverSchedule from "./pages/driver/DriverSchedule";

export default function App() {
  return (
    <AppStateProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<RootRedirect />} />

              <Route element={<RoleGuard allow={["admin"]} />}>
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/requests" element={<AdminRequests />} />
                <Route path="admin/live" element={<AdminLiveTrips />} />
                <Route path="admin/drivers" element={<AdminDrivers />} />
                <Route path="admin/employees" element={<AdminEmployees />} />
                <Route path="admin/reports" element={<AdminReports />} />
                <Route path="admin/settings" element={<AdminSettings />} />
              </Route>

              <Route element={<RoleGuard allow={["employee"]} />}>
                <Route path="employee" element={<EmployeeDashboard />} />
                <Route path="employee/request" element={<RequestRide />} />
                <Route path="employee/notifications" element={<NotificationsPage />} />
                <Route path="employee/profile" element={<ProfilePage />} />
              </Route>

              <Route element={<RoleGuard allow={["driver"]} />}>
                <Route path="driver" element={<DriverDashboard />} />
                <Route path="driver/schedule" element={<DriverSchedule />} />
                <Route path="driver/notifications" element={<NotificationsPage />} />
                <Route path="driver/profile" element={<ProfilePage />} />
              </Route>

              <Route path="trips" element={<TripHistoryPage />} />
              <Route path="live-trip/:tripId" element={<LiveTripPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppStateProvider>
  );
}
