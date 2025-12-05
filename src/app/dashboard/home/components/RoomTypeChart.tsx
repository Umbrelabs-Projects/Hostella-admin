// src/app/dashboard/home/components/RoomTypeChart.tsx

"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { RoomTypeDistribution } from "@/types/analytics";

interface RoomTypeChartProps {
  data: RoomTypeDistribution[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function RoomTypeChart({ data }: RoomTypeChartProps) {
  const chartData = data.map((item) => ({
    name: item.roomType,
    Bookings: item.count,
    Revenue: item.revenue,
  }));

  return (
    <Card className="p-6 border border-gray-200 bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Room Type Distribution</h3>
        <p className="text-sm text-gray-600">Bookings and revenue by room type</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" style={{ fontSize: 12 }} />
          <YAxis dataKey="name" type="category" stroke="#6b7280" style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="Bookings" radius={[0, 8, 8, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
