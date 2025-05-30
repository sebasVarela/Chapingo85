'use client';
import { updateAmountPaid } from "../actions";

export default function UpdateAmountPaidForm({ 
  registrationId, 
  currentAmount,
  onSuccess // <-- Nueva prop
}: { 
  registrationId: string, 
  currentAmount: number,
  onSuccess?: () => void 
}) {

  async function handleSubmit(formData: FormData) {
    await updateAmountPaid(formData);
    if (onSuccess) {
      onSuccess(); // Cierra el modal después de la acción
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="registration_id" value={registrationId} />
      <div>
        <label htmlFor="new_amount" className="block text-sm font-medium text-gray-700">
          Monto Abonado
        </label>
        <div className="relative mt-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
          <input
            type="number"
            name="new_amount"
            id="new_amount" // <-- Añadido id para el label
            step="0.01"
            defaultValue={currentAmount}
            className="pl-7 pr-12 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
      </div>
      <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
        Guardar Abono
      </button>
    </form>
  );
}