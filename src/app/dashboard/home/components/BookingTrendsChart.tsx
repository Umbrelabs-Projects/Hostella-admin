// src/app/dashboard/home/components/BookingTrendsChart.tsx

"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DailyBookingTrend } from "@/types/analytics";

interface BookingTrendsChartProps {
  data: DailyBookingTrend[];
}

export default function BookingTrendsChart({ data }: BookingTrendsChartProps) {
  // Format data for chart - show last 14 days for better visibility
  const chartData = data.slice(-14).map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Bookings: item.bookings,
    Revenue: item.revenue,
    Approved: item.approved,
  }));

  return (
    <Card className="p-6 border border-gray-200 bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Booking Trends (Last 14 Days)</h3>
        <p className="text-sm text-gray-600">Daily booking activity and revenue</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="Bookings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Approved" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          <Line
            type="monotone"
            dataKey="Revenue"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
            yAxisId={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
