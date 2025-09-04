import React, { createContext, useContext, useState } from 'react';

const FleetContext = createContext();

export function FleetProvider({ children }) {
  const [fleet, setFleet] = useState([
    // Example initial data
    {
      id: 'BMW-001',
      name: 'BMW 7 Series - BMW-001',
      type: 'Luxury Sedan',
      driverRate: 21,
      fuelRate: 0.49,
      runningCost: 0.32,
      insuranceRate: 35,
      capacity: 4
    },
    {
      id: 'MERC-SUV-001',
      name: 'Mercedes GLS - MERC-SUV-001',
      type: 'Executive SUV',
      driverRate: 23,
      fuelRate: 0.64,
      runningCost: 0.41,
      insuranceRate: 41,
      capacity: 6
    },
    {
      id: 'COACH-A',
      name: 'Volvo Coach - COACH-A',
      type: 'Luxury Coach',
      driverRate: 29,
      fuelRate: 0.99,
      runningCost: 0.76,
      insuranceRate: 52,
      capacity: 49
    }
  ]);

  // Add, edit, delete vehicle functions
  const addVehicle = (vehicle) => setFleet([...fleet, vehicle]);
  const editVehicle = (id, updated) => setFleet(fleet.map(v => v.id === id ? { ...v, ...updated } : v));
  const deleteVehicle = (id) => setFleet(fleet.filter(v => v.id !== id));

  return (
    <FleetContext.Provider value={{ fleet, addVehicle, editVehicle, deleteVehicle }}>
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  return useContext(FleetContext);
}
