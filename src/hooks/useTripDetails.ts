import { useMemo } from "react";
import { useAppState } from "../state/AppStateContext";
import { getEmployeeById } from "../data/employees";
import { getDriverById } from "../data/drivers";
import { getLocationById } from "../data/locations";
import { getRouteById } from "../data/routes";
import { Trip } from "../types";

export function useTripDetails(trip: Trip | undefined) {
  const { state } = useAppState();

  return useMemo(() => {
    if (!trip) return undefined;
    const employee =
      state.employees.find((e) => e.id === trip.employeeId) ??
      getEmployeeById(trip.employeeId);
    const driver =
      state.drivers.find((d) => d.id === trip.driverId) ??
      getDriverById(trip.driverId);
    const pickup = getLocationById(trip.pickupLocationId);
    const destination = getLocationById(trip.destinationLocationId);
    const route = getRouteById(trip.routeId);

    return { trip, employee, driver, pickup, destination, route };
  }, [trip, state.employees, state.drivers]);
}

export function useTripById(tripId: string | undefined) {
  const { state } = useAppState();
  const trip = useMemo(
    () => state.trips.find((t) => t.id === tripId),
    [state.trips, tripId],
  );
  return useTripDetails(trip);
}
