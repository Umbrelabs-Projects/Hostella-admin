import React from "react";
import { StudentBooking } from "@/types/booking";

export default function DataTable({
  data,
  onRowClick
}: {
  data: StudentBooking[];
  onRowClick: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left">
            <th className="w-8">#</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Hostel</th>
            <th>Room Type</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((b, idx) => (
            <tr key={b.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(b.id)}>
              <td className="py-2">{idx + 1}</td>
              <td className="py-2">{b.firstName} {b.lastName}</td>
              <td className="py-2">{b.phone}</td>
              <td className="py-2">{b.hostelName}</td>
              <td className="py-2">{b.roomTitle}</td>
              <td className="py-2">{b.price}</td>
              <td className="py-2">
                <span className={
                  `inline-block px-2 py-1 rounded text-xs ${
                    b.status === "pending payment"
                      ? "bg-yellow-100 text-yellow-800"
                      : b.status === "pending approval"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`
                }>{b.status}</span>
              </td>
              <td className="py-2">
                <div className="flex gap-2">
                  <button className="text-sm text-blue-600">View</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <div className="p-4 text-center text-gray-500">No results.</div>}
    </div>
  );
}
