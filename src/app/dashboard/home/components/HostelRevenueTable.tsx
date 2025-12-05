// src/app/dashboard/home/components/HostelRevenueTable.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevenueByHostel } from "@/types/analytics";
import { Building2, TrendingUp } from "lucide-react";

interface HostelRevenueTableProps {
  data: RevenueByHostel[];
}

export default function HostelRevenueTable({ data }: HostelRevenueTableProps) {
  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

  return (
    <Card className="p-6 border border-gray-200 bg-white">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hostel Performance</h3>
          <p className="text-sm text-gray-600">Revenue and occupancy by hostel</p>
        </div>
        <Building2 className="h-6 w-6 text-gray-400" />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Hostel Name</TableHead>
              <TableHead className="font-semibold text-right">Bookings</TableHead>
              <TableHead className="font-semibold text-right">Revenue (GHS)</TableHead>
              <TableHead className="font-semibold text-right">Occupancy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No hostel data available
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((hostel, index) => (
                <TableRow key={hostel.hostelName} className="hover:bg-gray-50">
                  <TableCell className="font-medium flex items-center gap-2">
                    {index === 0 && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {hostel.hostelName}
                  </TableCell>
                  <TableCell className="text-right">{hostel.bookings}</TableCell>
                  <TableCell className="text-right font-medium">
                    {hostel.revenue.toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(hostel.occupancyRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{hostel.occupancyRate.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
