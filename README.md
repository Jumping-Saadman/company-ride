# NexaCore Ride Management — User Manual

A frontend-only business travel ride management system for **NexaCore Industries**, built as an interview/demo prototype. All data lives in browser `localStorage` — there is no backend, database, or real authentication.

## Getting Started

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to `http://localhost:5173`). The app loads with realistic seed data already in place — employees, drivers, ride requests, and trips in various states — so it looks populated from the first load.

There is no login. Instead, you switch between roles using the **demo user menu** in the top-right corner.

## Demo Mode & Role Switching

Click the account chip in the top-right header to open the demo menu. From here you can:

- **Switch Demo Role** — jump between **Admin**, **Employee**, and **Driver**. Switching role navigates you to that role's dashboard.
- **Demo Employee / Demo Driver** — when in Employee or Driver mode, pick *which* employee or driver you're acting as (e.g. "Arif Hossain" or "Rahim Uddin").
- **Demo Controls**:
  - **Simulate New Request** — injects a random pending ride request, as if an employee just submitted one.
  - **Start Sample Trip** — auto-approves a pending request, assigns an available driver, and starts the trip.
  - **Complete Sample Trip** — fast-forwards the first active trip straight through to completion.
  - **Switch Demo User** — reopens this menu.
  - **Reset Demo Data** — wipes all changes and restores the original seed data (asks for confirmation first).

All three roles share the same underlying state, so actions taken as one role (e.g. an Employee submitting a request) are immediately visible to the others (e.g. Admin sees it in Ride Requests).

A small amber **Demo Mode** badge is always visible at the bottom of the sidebar as a reminder this is a prototype.

## Walkthrough by Role

### Admin (Sarah Rahman, Transport Administrator)

- **Dashboard** (`/admin`) — KPI cards (trips today, pending requests, active trips, available drivers), active trips list, quick actions, today's/upcoming trips.
- **Ride Requests** (`/admin/requests`) — search/filter incoming requests. Click a row to open the detail drawer, where you can **Approve**, **Reject**, **Cancel**, or **Assign Driver** (opens a modal listing drivers with availability, vehicle, and today's trip count).
- **Live Trips** (`/admin/live`) — fleet map showing every vehicle currently on the road. Click a trip in the side list (or a marker on the map) to focus on it.
- **Trips** (`/trips`) — full trip history across the company, with filters and a detail drawer showing the timeline.
- **Drivers** (`/admin/drivers`) — roster with contact info, vehicle, trip counts, and Activate/Deactivate controls.
- **Employees** (`/admin/employees`) — directory with department/status filters and trip counts.
- **Reports** (`/admin/reports`) — charts: trips per week, trips by destination, completed vs. cancelled, driver utilization, monthly volume.
- **Settings** (`/admin/settings`) — company info, notification toggles, and the trip policy (1-day minimum lead time).

### Employee (e.g. Arif Hossain)

- **Dashboard** (`/employee`) — greeting, active trip (with live map, if one is in progress), next upcoming trip, and recent completed trips.
- **Request Ride** (`/employee/request`) — 3-step form: trip details → review → confirmation. Travel date must be **at least 1 day in the future** (same-day and past dates are rejected with a clear message). On submit you get a reference ID (e.g. `TR-2026-0045`) and the request instantly appears in the Admin's Ride Requests queue.
- **My Trips** (`/trips`) — this employee's own trip history.
- **Notifications** (`/employee/notifications`) — updates like "Your ride has been assigned to Rahim Uddin."
- **Profile** (`/employee/profile`) — read-only contact/department info.

### Driver (e.g. Rahim Uddin)

- **Dashboard** (`/driver`) — current active trip with a live map (if any), plus a schedule list of upcoming/today's assigned trips.
- **Today's Trips** (`/driver/schedule`) — every trip assigned to this driver, chronologically, with action buttons.
- **Trip status workflow** — each assigned trip advances through a strict sequence via a single action button whose label always shows the next valid step:
  1. Scheduled → **Start / Driver En Route**
  2. → **Arrived at Pickup**
  3. → **Passenger Picked Up**
  4. → **Start Journey** (now `In Progress`)
  5. → **Complete Trip**
- **Trip History** (`/trips`) — this driver's completed trips.

## Live GPS Simulation

Once a trip reaches **In Progress**, the vehicle starts moving along its route automatically — you don't need to open the Live Trip page or press anything for it to start:

- A background simulation driver advances every in-progress trip continuously in shared state, so a vehicle keeps moving even while you're looking at a completely different page or role.
- Routes are real road-snapped driving directions (fetched once from OSRM and baked into the app), so the vehicle follows actual Dhaka streets rather than a straight line, drawn as a turn-by-turn-style route line (white casing + colored path, with the already-driven portion fading to gray).
- Open the trip's **Live Trip** page (`/live-trip/:tripId`, reachable via "View Live Trip" / "Open full live trip view") or any dashboard's active-trip card to watch it, and use the **Simulation** controls to Pause/Resume, Reset, or speed it up to **1×/2×/4×/8×** — handy for skipping ahead through a demo instead of waiting in real time.
- Position, ETA, distance remaining, and progress percentage stay in sync across every screen watching that trip (Employee dashboard, Driver dashboard, Admin Live Trips, and the Live Trip page all reflect the same simulation state).
- The Trip Timeline (visible on the Live Trip page and in Trip History) records each status change with a timestamp.
- The planned route is also shown as a preview map on the ride request review step and in the admin's request detail drawer, before a trip has even started.

## End-to-End Demo Script

A good way to demonstrate the whole system in one sitting:

1. Switch to **Employee → Arif Hossain**. Submit a ride request for tomorrow, HQ → Factory.
2. Switch to **Admin**. Open Ride Requests, find the new request, **Approve** it, then **Assign Driver** (pick an available driver, e.g. Rahim Uddin).
3. Switch to **Driver → Rahim Uddin**. On the dashboard, click through the status buttons: Driver En Route → Arrived at Pickup → Passenger Picked Up → Start Journey.
4. Switch to **Employee**. The dashboard now shows the Active Trip with a live map — the vehicle is already moving on its own; ETA and progress update automatically (use the 2×/4×/8× speed buttons to fast-forward if you don't want to wait).
5. Switch to **Admin → Live Trips**. See the same vehicle still moving on the fleet map, right where the simulation left it.
6. Switch back to **Driver** and click **Complete Trip**.
7. Check **Trip History** (any role) — the completed trip is there with duration and distance.

No page refresh is needed at any point — everything is driven by shared in-memory state, persisted to `localStorage` as you go.

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · MapLibre GL JS (OpenStreetMap tiles) · Recharts · Framer Motion · DiceBear (generated profile pictures) · Lucide icons

## Notes

- Locations are real Dhaka coordinates (HQ in Rampura, Factory in Tejgaon, client offices in Karwan Bazar and Gulshan-2, a branch in Banani, and Hazrat Shahjalal International Airport).
- Every person in the app (admin, every employee, every driver) has a distinct, deterministically generated profile picture — same person always gets the same picture, no photo upload needed.
- There is no backend: refreshing the page keeps your changes (via `localStorage`), but clearing site data or using **Reset Demo Data** returns everything to the original seed state.
