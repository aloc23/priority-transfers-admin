import React, { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { exportToCSV } from "../utils/export";

export default function Reports() {
  const { bookings, drivers, activityHistory } = useAppStore();
  const [filter, setFilter] = useState("all");

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const exportData = () => {
    const rows = filteredBookings.map((b) => ({
      Date: new Date(b.date).toLocaleString(),
      Customer: b.customerId,
      Driver: b.driverId,
      Status: b.status,
    }));
    exportToCSV(rows, "Bookings_Report");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "completed", "pending", "cancelled"].map((f) => (
          <button
            key={f}
            className={`px-3 py-1 rounded-lg border ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button
          className="ml-auto bg-green-600 text-white px-4 py-1 rounded-lg"
          onClick={exportData}
        >
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-sm text-gray-600">Total Bookings</h2>
          <p className="text-2xl font-bold">{bookings.length}</p>
        </div>
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-sm text-gray-600">Drivers</h2>
          <p className="text-2xl font-bold">{drivers.length}</p>
        </div>
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-sm text-gray-600">Activity Logs</h2>
          <p className="text-2xl font-bold">{activityHistory.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border">Date</th>
              <th className="p-2 text-left border">Customer</th>
              <th className="p-2 text-left border">Driver</th>
              <th className="p-2 text-left border">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="p-2 border">
                  {new Date(b.date).toLocaleString()}
                </td>
                <td className="p-2 border">{b.customerId}</td>
                <td className="p-2 border">{b.driverId}</td>
                <td className="p-2 border capitalize">{b.status}</td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
