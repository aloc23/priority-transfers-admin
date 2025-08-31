import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function Schedule() {
  const { bookings, addBooking, updateBooking, deleteBooking, customers, drivers, vehicles } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    customer: "",
    pickup: "",
    destination: "",
    date: "",
    time: "",
    driver: "",
    vehicle: "",
    status: "pending"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBooking) {
      updateBooking(editingBooking.id, formData);
    } else {
      addBooking(formData);
    }
    setShowModal(false);
    setEditingBooking(null);
    setFormData({
      customer: "",
      pickup: "",
      destination: "",
      date: "",
      time: "",
      driver: "",
      vehicle: "",
      status: "pending"
    });
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData(booking);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteBooking(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          New Booking
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Date & Time</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="font-medium">{booking.customer}</td>
                  <td className="text-sm">{booking.pickup}</td>
                  <td className="text-sm">{booking.destination}</td>
                  <td className="text-sm">{booking.date} {booking.time}</td>
                  <td className="text-sm">{booking.driver}</td>
                  <td className="text-sm">{booking.vehicle}</td>
                  <td>
                    <span className={`badge ${
                      booking.status === 'confirmed' ? 'badge-green' :
                      booking.status === 'pending' ? 'badge-yellow' :
                      booking.status === 'completed' ? 'badge-blue' :
                      'badge-red'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(booking)}
                        className="btn btn-outline px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="text-xl font-bold mb-4">
              {editingBooking ? "Edit Booking" : "New Booking"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Customer</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Driver</label>
                  <select
                    value={formData.driver}
                    onChange={(e) => setFormData({...formData, driver: e.target.value})}
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.name}>{driver.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={formData.pickup}
                  onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Vehicle</label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={`${vehicle.make} ${vehicle.model}`}>
                        {vehicle.make} {vehicle.model} ({vehicle.license})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingBooking ? "Update" : "Create"} Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBooking(null);
                    setFormData({
                      customer: "",
                      pickup: "",
                      destination: "",
                      date: "",
                      time: "",
                      driver: "",
                      vehicle: "",
                      status: "pending"
                    });
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}