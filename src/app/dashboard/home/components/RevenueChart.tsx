// src/app/dashboard/home/components/RevenueChart.tsx

"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MonthlyRevenue } from "@/types/analytics";

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    month: item.month,
    Revenue: item.revenue,
    Bookings: item.bookings,
  }));

  return (
    <Card className="p-6 border border-gray-200 bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue & Bookings</h3>
        <p className="text-sm text-gray-600">Revenue trends over the last 6 months</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="Revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Bookings" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
