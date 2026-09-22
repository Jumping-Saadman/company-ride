import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppState } from "../../state/AppStateContext";
import {
  getCompletedVsCancelled,
  getDriverUtilization,
  getMonthlyVolume,
  getTripsByDestination,
  getWeeklyTrips,
} from "../../lib/reportsData";
import { CHART_CATEGORICAL, CHART_INK, CHART_STATUS } from "../../lib/chartColors";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: `1px solid ${CHART_INK.grid}`,
  boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
};

const axisTick = { fill: CHART_INK.muted, fontSize: 12 };

export default function AdminReports() {
  const { state } = useAppState();

  const weekly = getWeeklyTrips(state);
  const destinations = getTripsByDestination(state);
  const statusSplit = getCompletedVsCancelled(state);
  const utilization = getDriverUtilization(state);
  const monthly = getMonthlyVolume(state);

  return (
    <div>
      <PageHeader title="Reports" description="Fleet performance and travel activity insights." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Trips per Week" description="Total trips completed or in progress" />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weekly} barCategoryGap={24}>
                <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
                <XAxis dataKey="week" tick={axisTick} axisLine={{ stroke: CHART_INK.axis }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
                <Bar dataKey="trips" fill={CHART_CATEGORICAL[0]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Trips by Destination" description="Most visited business locations" />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={destinations} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid horizontal={false} stroke={CHART_INK.grid} />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
                <Bar dataKey="trips" fill={CHART_CATEGORICAL[2]} radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Completed vs Cancelled" description="Trip and request outcomes" />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  <Cell fill={CHART_STATUS.good} />
                  <Cell fill={CHART_STATUS.critical} />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  formatter={(value) => <span style={{ color: CHART_INK.secondary, fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Driver Utilization" description="Total trips completed by each driver" />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={utilization} barCategoryGap={20}>
                <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
                <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: CHART_INK.axis }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
                <Bar dataKey="trips" fill={CHART_CATEGORICAL[6]} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Travel Volume" description="Total trips per month" />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
                <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: CHART_INK.axis }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="trips"
                  stroke={CHART_CATEGORICAL[0]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: CHART_CATEGORICAL[0] }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
