'use client';


import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { updateAmountPaid } from "../actions";
import SubmitButton from './SubmitButton';

const initialState = {
  success: false,
  message: undefined,
  updatedRegistration: null,
};

export default function UpdateAmountPaidForm({ 
  registrationId, 
  currentAmount,
  onActionComplete 
}: { 
  registrationId: string, 
  currentAmount: number,
  onActionComplete: (updatedRegistration: any) => void 
}) {
  const [formState, formAction] = useFormState(updateAmountPaid, initialState);

  useEffect(() => {
    if (formState.success && formState.updatedRegistration) {
      onActionComplete(formState.updatedRegistration);
      // No necesitamos cerrar el modal aquí si el padre lo hace
    }
    if (!formState.success && formState.message) {
      // Podrías mostrar un toast o alerta aquí con formState.message
      console.error("Error desde UpdateAmountPaidForm:", formState.message);
    }
  }, [formState, onActionComplete]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="registration_id" value={registrationId} />
      <div>
        <label htmlFor={`new_amount_${registrationId}`} className="block text-sm font-medium text-gray-700">
          Monto Abonado
        </label>
        <div className="relative mt-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
          <input
            type="number"
            name="new_amount"
            id={`new_amount_${registrationId}`}
            step="0.01"
            defaultValue={currentAmount}
            className="pl-7 pr-12 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
            required
          />
        </div>
      </div>
      {formState.message && !formState.success && (
        <p className="text-sm text-red-600">{formState.message}</p>
      )}
      <SubmitButton 
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        pendingText="Actualizando..."
      >
        Actualizar Abono
      </SubmitButton>
    </form>
  );
}