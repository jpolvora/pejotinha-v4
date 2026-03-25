"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityLog = {
  date: string; // ISO String or YYYY-MM-DD
  durationMinutes: number;
};

interface ProductivityChartProps {
  data: ActivityLog[];
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  // Aggregate data for the last 7 days
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().split("T")[0],
        displayDate: d.toLocaleDateString("en-US", { weekday: "short" }),
        hours: 0,
      };
    });

    data.forEach((log) => {
      const logDate = log.date.split("T")[0]; // ensure format is YYYY-MM-DD
      const dayData = last7Days.find((d) => d.date === logDate);
      if (dayData) {
        dayData.hours += log.durationMinutes / 60;
      }
    });

    return last7Days;
  }, [data]);

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="displayDate"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip 
            cursor={{ fill: "hsl(var(--muted))" }} 
            contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "10px", borderColor: "hsl(var(--border))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Bar
            dataKey="hours"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
