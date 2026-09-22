import { Navigate, Outlet } from "react-router-dom";
import { useAppState } from "../../state/AppStateContext";
import { UserRole } from "../../types";

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  employee: "/employee",
  driver: "/driver",
};

export function RoleGuard({ allow }: { allow: UserRole[] }) {
  const { state } = useAppState();
  const role = state.currentUser.role;

  if (!allow.includes(role)) {
    return <Navigate to={ROLE_HOME[role]} replace />;
  }

  return <Outlet />;
}
