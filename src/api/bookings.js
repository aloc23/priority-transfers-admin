import { supabase } from "@/utils/supabaseClient";

export async function fetchBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      pickup,
      dropoff,
      scheduled_at,
      status,
      drivers (
        id,
        name,
        email
      ),
      vehicles (
        id,
        make,
        model,
        plate_number
      )
    `)
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error("Error fetching bookings:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((b) => ({
    id: b.id,
    pickup: b.pickup,
    dropoff: b.dropoff,
    scheduledAt: b.scheduled_at,
    status: b.status,
    driver: b.drivers
      ? {
          id: b.drivers.id,
          name: b.drivers.name,
          email: b.drivers.email,
        }
      : null,
    vehicle: b.vehicles
      ? {
          id: b.vehicles.id,
          name: `${b.vehicles.make} ${b.vehicles.model}`,
          plate: b.vehicles.plate_number,
        }
      : null,
  }));
}