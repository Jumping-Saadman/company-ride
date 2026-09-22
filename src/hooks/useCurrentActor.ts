import { useAppSelector } from "../state/AppStateContext";
import { Driver, Employee } from "../types";

export function useCurrentEmployee(): Employee | undefined {
  return useAppSelector((s) =>
    s.employees.find((e) => e.id === s.currentUser.employeeId),
  );
}

export function useCurrentDriver(): Driver | undefined {
  return useAppSelector((s) =>
    s.drivers.find((d) => d.id === s.currentUser.driverId),
  );
}
