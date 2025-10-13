import React, { useMemo, useState } from "react";
import { useAppStore } from "../context/AppStore";
import DateTimePicker from "../components/DateTimePicker";
import { useResponsive } from "../hooks/useResponsive";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";
import moment from "moment";

export default function Bookings() {
  const {
    bookings,
    customers,
    drivers,
    vehicles,
    addBooking,
    updateBooking,
    deleteBooking,
    confirmBooking,
    markBookingCompleted,
  } = useAppStore();

  const { isMobile } = useResponsive();
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();

  const [form, setForm] = useState({
    customer: "",
    pickup: "",
    destination: "",
    datetime: "", // Combined date and time
    driver: "",
    vehicle: "",
    price: 45,
    type: "priority",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sorted = useMemo(() => {
    return [...(bookings || [])].sort((a, b) => {
      const da = `${a.date ?? ""} ${a.time ?? ""}`;
      const db = `${b.date ?? ""} ${b.time ?? ""}`;
      return da.localeCompare(db);
    });
  }, [bookings]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.customer || !form.customer.trim()) {
      newErrors.customer = "Customer name is required";
    }

    if (!form.pickup || !form.pickup.trim()) {
      newErrors.pickup = "Pickup location is required";
    }

    if (!form.destination || !form.destination.trim()) {
      newErrors.destination = "Destination is required";
    }

    if (!form.datetime) {
      newErrors.datetime = "Date and time are required";
    }

    if (form.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onCreate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showWarning("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert datetime back to separate date and time for compatibility
      let date = '';
      let time = '';
      if (form.datetime) {
        const momentDateTime = moment(form.datetime);
        date = momentDateTime.format('YYYY-MM-DD');
        time = momentDateTime.format('HH:mm');
      } else {
        // Default to today and 09:00 if no datetime selected
        date = new Date().toISOString().split("T")[0];
        time = "09:00";
      }
      
      const bookingData = {
        ...form,
        date,
        time,
        status: 'pending'
      };
      
      // Remove the combined datetime field
      delete bookingData.datetime;
      
      await addBooking(bookingData);
      showSuccess(`Booking for ${form.customer} created successfully`);
      setForm({ customer: "", pickup: "", destination: "", datetime: "", driver: "", vehicle: "", price: 45, type: "priority" });
      setErrors({});
    } catch (error) {
      showError(`Failed to create booking: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickConfirm = async (b) => {
    if (b.status !== "confirmed" && b.status !== "completed") {
      try {
        await updateBooking(b.id, { status: "confirmed" });
        showSuccess(`Booking for ${b.customer} confirmed`);
      } catch (error) {
        showError(`Failed to confirm booking: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const quickComplete = async (b) => {
    if (b.status !== "completed") {
      try {
        await markBookingCompleted(b.id);
        showSuccess(`Booking for ${b.customer} marked as completed`);
      } catch (error) {
        showError(`Failed to complete booking: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleDelete = async (b) => {
    if (confirm(`Delete booking for ${b.customer}?`)) {
      try {
        await deleteBooking(b.id);
        showSuccess(`Booking for ${b.customer} deleted`);
      } catch (error) {
        showError(`Failed to delete booking: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
      </div>

      {/* Booking Form */}
      <form onSubmit={onCreate} className="card">
        <h2 className="text-xl font-bold mb-4">Add New Booking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Customer <span className="text-red-500">*</span>
            </label>
            <input
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              placeholder="Customer name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.customer ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.customer && (
              <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Pickup <span className="text-red-500">*</span>
            </label>
            <input
              value={form.pickup}
              onChange={(e) => setForm({ ...form, pickup: e.target.value })}
              placeholder="From"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.pickup ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.pickup && (
              <p className="text-red-500 text-sm mt-1">{errors.pickup}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Destination <span className="text-red-500">*</span>
            </label>
            <input
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              placeholder="To"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.destination ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.destination && (
              <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
            )}
          </div>
          
          <div>
            <DateTimePicker
              id="booking-datetime"
              label="Date & Time"
              value={form.datetime}
              onChange={(datetime) => setForm({...form, datetime})}
              placeholder="Select pickup date and time..."
              minDate={new Date().toISOString().split('T')[0]}
              helpText="When to pick up the passenger"
              isMobile={isMobile}
            />
            {errors.datetime && (
              <p className="text-red-500 text-sm mt-1">{errors.datetime}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-1 font-medium text-gray-700">Driver</label>
            <select
              value={form.driver}
              onChange={(e) => setForm({ ...form, driver: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select driver (optional)</option>
              {(drivers || []).map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} - {d.status}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium text-gray-700">Vehicle</label>
            <select
              value={form.vehicle}
              onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select vehicle (optional)</option>
              {(vehicles || []).map((v) => (
                <option
                  key={v.id}
                  value={v.license ? `${v.make} ${v.model} - ${v.license}` : `${v.make} ${v.model}`}
                >
                  {v.license ? `${v.make} ${v.model} - ${v.license}` : `${v.make} ${v.model}`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.price ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>
          
          <div className="flex items-end">
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Booking'}
            </button>
          </div>
        </div>
      </form>

      {/* Bookings Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">All Bookings</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Customer</th>
                <th className="text-left">Route</th>
                <th className="text-left">Date/Time</th>
                <th className="text-left">Driver</th>
                <th className="text-left">Vehicle</th>
                <th className="text-left">Price</th>
                <th className="text-left">Status</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="font-medium">{b.customer}</td>
                  <td className="text-sm">
                    <div>{b.pickup}</div>
                    <div className="text-gray-500">→ {b.destination}</div>
                  </td>
                  <td className="whitespace-nowrap">
                    <div>{b.date}</div>
                    <div className="text-sm text-gray-500">{b.time}</div>
                  </td>
                  <td>{b.driver || "—"}</td>
                  <td className="text-sm">{b.vehicle || "—"}</td>
                  <td className="font-medium">€{(b.price ?? b.amount ?? 0).toFixed(2)}</td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === 'completed' ? 'bg-green-100 text-green-700' :
                      b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => quickConfirm(b)} 
                        disabled={b.status === "confirmed" || b.status === "completed"}
                        className="btn btn-outline px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => quickComplete(b)} 
                        disabled={b.status === "completed"}
                        className="btn btn-primary px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="btn btn-danger px-2 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No bookings yet. Add your first booking to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}