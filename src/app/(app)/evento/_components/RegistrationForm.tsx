'use client';

import { useState, useEffect } from 'react';
import { registerForEvent } from '../actions';

const TICKET_PRICE = 1500;

export default function RegistrationForm({ userId }: { userId: string }) {
  const [numberOfGuests, setNumberOfGuests] = useState(0);
  const [attendingWithVehicle, setAttendingWithVehicle] = useState(false);
  const [totalToPay, setTotalToPay] = useState(TICKET_PRICE);

  useEffect(() => {
    // El total es el boleto del egresado + los de sus acompañantes
    const total = (1 + numberOfGuests) * TICKET_PRICE;
    setTotalToPay(total);
  }, [numberOfGuests]);

  return (
    <form action={registerForEvent} className="space-y-6">
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="total_to_pay" value={totalToPay} />

      <div>
        <label htmlFor="number_of_guests" className="block text-sm font-medium text-gray-700">
          Número de Acompañantes (adicionales a ti)
        </label>
        <input 
          type="number" 
          name="number_of_guests" 
          id="number_of_guests"
          min="0"
          value={numberOfGuests}
          onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 0)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
        />
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input 
            id="attending_with_vehicle" 
            name="attending_with_vehicle" 
            type="checkbox"
            checked={attendingWithVehicle}
            onChange={(e) => setAttendingWithVehicle(e.target.checked)}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="attending_with_vehicle" className="font-medium text-gray-700">¿Asistirás en vehículo?</label>
        </div>
      </div>

      {attendingWithVehicle && (
        <div>
          <label htmlFor="number_of_vehicles" className="block text-sm font-medium text-gray-700">
            Número de Vehículos
          </label>
          <input 
            type="number" 
            name="number_of_vehicles" 
            id="number_of_vehicles" 
            min="1"
            defaultValue="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
          />
        </div>
      )}
      
      <div className="text-center bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-gray-600">Total a Pagar:</p>
        <p className="text-3xl font-bold text-indigo-600">
          ${totalToPay.toLocaleString('es-MX')} MXN
        </p>
      </div>

      <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700">
        Registrar Asistencia
      </button>
    </form>
  );
}