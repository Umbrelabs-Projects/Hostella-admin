// src/app/dashboard/home/components/StatusDistributionChart.tsx

"use client";

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { StatusBreakdown } from "@/types/analytics";

interface StatusDistributionChartProps {
  data: StatusBreakdown[];
}

const COLORS = {
  "Pending Payment": "#ef4444",
  "Pending Approval": "#f59e0b",
  Approved: "#10b981",
};

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
  }));

  return (
    <Card className="p-6 border border-gray-200 bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Booking Status Distribution</h3>
        <p className="text-sm text-gray-600">Current status breakdown</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
