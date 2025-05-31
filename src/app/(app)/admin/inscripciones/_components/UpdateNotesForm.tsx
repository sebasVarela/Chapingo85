'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { updateOrganizerNotes } from "../actions";
import SubmitButton from './SubmitButton'; // Asumiendo que SubmitButton.tsx ya existe

// Define o importa ActionResponseState
type ActionResponseState = {
  success: boolean;
  message?: string;
  updatedRegistration?: any; 
};

const initialState: ActionResponseState = {
  success: false,
  message: undefined,
  updatedRegistration: null,
};

export default function UpdateNotesForm({ 
  registrationId, 
  currentNotes,
  onActionComplete // Cambiamos de onSuccess a onActionComplete
}: { 
  registrationId: string, 
  currentNotes: string,
  onActionComplete: (updatedRegistration: any) => void 
}) {
  // @ts-ignore
  const [formState, formAction] = useFormState(updateOrganizerNotes, initialState);

  useEffect(() => {
    if (formState.success && formState.updatedRegistration) {
      onActionComplete(formState.updatedRegistration);
    }
    if (!formState.success && formState.message) {
      console.error("Error desde UpdateNotesForm:", formState.message);
    }
  }, [formState, onActionComplete]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="registration_id" value={registrationId} />
      <div>
        <label htmlFor={`new_notes_${registrationId}`} className="block text-sm font-medium text-gray-700">
          Notas para el Egresado
        </label>
        <textarea
          name="new_notes"
          id={`new_notes_${registrationId}`}
          defaultValue={currentNotes}
          rows={3} // Reducido para el modal
          className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Escribe una nota..."
        />
      </div>
      {formState.message && !formState.success && (
        <p className="text-sm text-red-600 mt-2">{formState.message}</p>
      )}
      <SubmitButton 
        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        pendingText="Guardando..."
      >
        Guardar Nota
      </SubmitButton>
    </form>
  );
}