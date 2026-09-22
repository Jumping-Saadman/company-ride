import { Navigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

export default function RootRedirect() {
  const { state } = useAppState();
  const role = state.currentUser.role;
  const target = role === "admin" ? "/admin" : role === "employee" ? "/employee" : "/driver";
  return <Navigate to={target} replace />;
}
