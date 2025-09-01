import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { formatCurrency } from "../utils/currency";
import { exportToCSV } from "../utils/export";
import {
  BookingIcon,
  DownloadIcon,
} from "../components/Icons";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Reports() {
  const { bookings } = useAppStore();
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Revenue + costs
  const totalRevenue = bookings.reduce((s, b) => s + (b.revenue || 0), 0);
  const outsourcedCost = bookings
    .filter((b) => b.type === "outsourced")
    .reduce((s, b) => s + (b.outsourceCost || 0), 0);
  const netProfit = totalRevenue - outsourcedCost;

  // Apply filters
  let filtered = [...bookings];
  if (typeFilter !== "all") filtered = filtered.filter((b) => b.type === typeFilter);
  if (statusFilter !== "all") filtered = filtered.filter((b) => b.status === statusFilter);

  // Chart data
  const revenueSplit = [
    {
      name: "In-house",
      value: bookings
        .filter((b) => b.type === "priority transfers")
        .reduce((s, b) => s + (b.revenue || 0), 0),
    },
    {
      name: "Outsourced",
      value: bookings
        .filter((b) => b.type === "outsourced")
        .reduce((s, b) => s + (b.revenue || 0), 0),
    },
  ];
  const statusSplit = ["completed", "pending", "cancelled"].map((s) => ({
    name: s,
    value: bookings.filter((b) => b.status === s).length,
  }));
  const trendData = Object.values(
    bookings.reduce((acc, b) => {
      const d = new Date(b.date).toLocaleDateString();
      if (!acc[d]) acc[d] = { date: d, revenue: 0 };
      acc[d].revenue += b.revenue || 0;
      return acc;
    }, {})
  );
  const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b"];

  const exportData = () => {
    const rows = filtered.map((b) => ({
      Date: new Date(b.date).toLocaleString(),
      Type: b.type,
      Status: b.status,
      Revenue: b.revenue || 0,
      OutsourceCost: b.outsourceCost || 0,
    }));
    exportToCSV(rows, "Bookings_Report");
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <BookingIcon className="w-6 h-6" /> Reports
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h2 className="text-sm text-gray-600">Total Revenue</h2>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h2 className="text-sm text-gray-600">Outsourced Cost</h2>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(outsourcedCost)}
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h2 className="text-sm text-gray-600">Net Profit</h2>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 border rounded-lg bg-white p-2 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Revenue Split</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={revenueSplit} dataKey="value" nameKey="name" outerRadius={80} label>
                {revenueSplit.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64 border rounded-lg bg-white p-2 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Booking Status</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusSplit}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64 border rounded-lg bg-white p-2 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "priority transfers", "outsourced"].map((t) => (
          <button
            key={t}
            className={`px-3 py-1 rounded-lg border ${
              typeFilter === t ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
            onClick={() => setTypeFilter(t)}
          >
            {t}
          </button>
        ))}
        {["all", "completed", "pending", "cancelled"].map((s) => (
          <button
            key={s}
            className={`px-3 py-1 rounded-lg border ${
              statusFilter === s ? "bg-green-600 text-white" : "bg-white text-gray-700"
            }`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
        <button
          className="ml-auto bg-indigo-600 text-white px-4 py-1 rounded-lg"
          onClick={exportData}
        >
          <DownloadIcon className="w-4 h-4 inline mr-1" /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border">Date</th>
              <th className="p-2 text-left border">Type</th>
              <th className="p-2 text-left border">Status</th>
              <th className="p-2 text-left border">Revenue</th>
              <th className="p-2 text-left border">Outsource Cost</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="p-2 border">{new Date(b.date).toLocaleString()}</td>
                <td className="p-2 border capitalize">{b.type}</td>
                <td className="p-2 border capitalize">{b.status}</td>
                <td className="p-2 border">{formatCurrency(b.revenue || 0)}</td>
                <td className="p-2 border">{formatCurrency(b.outsourceCost || 0)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500 italic">
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
