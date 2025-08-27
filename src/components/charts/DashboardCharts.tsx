"use client";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart as RBarChart,
  Bar,
  Legend,
} from "recharts";

export function PipelineChart({
  data,
}: {
  data: Array<{ label: string; jobCards: number; evaluations: number }>;
}) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.08)" />
          <XAxis
            dataKey="label"
            stroke="var(--ink-dim)"
            tickLine={false}
            axisLine={{ stroke: "rgba(0,0,0,.08)" } as any}
          />
          <YAxis
            stroke="var(--ink-dim)"
            tickLine={false}
            axisLine={{ stroke: "rgba(0,0,0,.08)" } as any}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--glass-stroke)",
              backdropFilter: "blur(10px)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="jobCards"
            name="Job Cards"
            stroke="var(--brand)"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="evaluations"
            name="Evaluations"
            stroke="var(--brand-2)"
            dot={false}
            strokeWidth={2}
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PaymentsChart({
  data,
  colorVar = "--brand",
}: {
  data: Array<{ label: string; value: number }>;
  colorVar?: string;
}) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.08)" />
          <XAxis
            dataKey="label"
            stroke="var(--ink-dim)"
            tickLine={false}
            axisLine={{ stroke: "rgba(0,0,0,.08)" } as any}
          />
          <YAxis
            stroke="var(--ink-dim)"
            tickLine={false}
            axisLine={{ stroke: "rgba(0,0,0,.08)" } as any}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--glass-stroke)",
              backdropFilter: "blur(10px)",
            }}
          />
          <Bar
            dataKey="value"
            name="Payments"
            fill={`var(${colorVar})`}
            radius={[6, 6, 0, 0]}
          />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}
