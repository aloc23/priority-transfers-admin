import React, { useMemo, useState } from "react";
import { useAppStore } from "../context/AppStore";
import DateTimePicker from "../components/DateTimePicker";
import { useResponsive } from "../hooks/useResponsive";
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

  const sorted = useMemo(() => {
    return [...(bookings || [])].sort((a, b) => {
      const da = `${a.date ?? ""} ${a.time ?? ""}`;
      const db = `${b.date ?? ""} ${b.time ?? ""}`;
      return da.localeCompare(db);
    });
  }, [bookings]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.customer || !form.pickup || !form.destination) return;
    
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
      time
    };
    
    // Remove the combined datetime field
    delete bookingData.datetime;
    
    await addBooking(bookingData);
    setForm((f) => ({ ...f, customer: "", pickup: "", destination: "", datetime: "" }));
  };

  const quickConfirm = async (b) => {
    if (b.status !== "confirmed") {
      await updateBooking(b.id, { status: "confirmed" });
      // or use confirmBooking for email/invoice side-effects:
      // await confirmBooking(b.id);
    }
  };

  const quickComplete = async (b) => {
    if (b.status !== "completed") {
      await markBookingCompleted(b.id);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Bookings</h1>

      <form
        onSubmit={onCreate}
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          alignItems: "end",
          background: "rgba(0,0,0,0.03)",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <div>
          <label>Customer</label>
          <input
            value={form.customer}
            onChange={(e) => setForm({ ...form, customer: e.target.value })}
            placeholder="Customer name"
            required
          />
        </div>
        <div>
          <label>Pickup</label>
          <input
            value={form.pickup}
            onChange={(e) => setForm({ ...form, pickup: e.target.value })}
            placeholder="From"
            required
          />
        </div>
        <div>
          <label>Destination</label>
          <input
            value={form.destination}
            onChange={(e) =>
              setForm({ ...form, destination: e.target.value })
            }
            placeholder="To"
            required
          />
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
        </div>
        <div>
          <label>Driver</label>
          <input
            list="drivers"
            value={form.driver}
            onChange={(e) => setForm({ ...form, driver: e.target.value })}
            placeholder="Driver (optional)"
          />
          <datalist id="drivers">
            {(drivers || []).map((d) => (
              <option key={d.id} value={d.name} />
            ))}
          </datalist>
        </div>
        <div>
          <label>Vehicle</label>
          <input
            list="vehicles"
            value={form.vehicle}
            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
            placeholder="Vehicle (optional)"
          />
          <datalist id="vehicles">
            {(vehicles || []).map((v) => (
              <option
                key={v.id}
                value={
                  v.license
                    ? `${v.make} ${v.model} - ${v.license}`
                    : `${v.make} ${v.model}`
                }
              />
            ))}
          </datalist>
        </div>
        <div>
          <label>Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <button type="submit">Add Booking</button>
        </div>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Customer</th>
              <th>From → To</th>
              <th>Date/Time</th>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ width: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => (
              <tr key={b.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{b.customer}</td>
                <td>
                  {b.pickup} → {b.destination}
                </td>
                <td>
                  {b.date} {b.time}
                </td>
                <td>{b.driver || "—"}</td>
                <td>{b.vehicle || "—"}</td>
                <td>{(b.price ?? b.amount ?? 0).toFixed(2)}</td>
                <td>{b.status}</td>
                <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => quickConfirm(b)} disabled={b.status === "confirmed" || b.status === "completed"}>
                    Confirm
                  </button>
                  <button onClick={() => quickComplete(b)} disabled={b.status === "completed"}>
                    Complete
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this booking?")) deleteBooking(b.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 16, opacity: 0.7 }}>
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}