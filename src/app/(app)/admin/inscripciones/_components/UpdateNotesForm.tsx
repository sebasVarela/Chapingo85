'use client';
import { updateOrganizerNotes } from '../actions';

export default function UpdateNotesForm({ 
  registrationId, 
  currentNotes,
  onSuccess // <-- Nueva prop
}: { 
  registrationId: string, 
  currentNotes: string,
  onSuccess?: () => void 
}) {

  async function handleSubmit(formData: FormData) {
    await updateOrganizerNotes(formData);
    if (onSuccess) {
      onSuccess(); // Cierra el modal
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="registration_id" value={registrationId} />
      <div>
        <label htmlFor="new_notes" className="block text-sm font-medium text-gray-700">
          La nota será visible para el en el resumen de la inscripción.
        </label>
        <textarea
          name="new_notes"
          id="new_notes" // <-- Añadido id
          defaultValue={currentNotes}
          rows={4}
          className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Escribe una nota..."
        />
      </div>
      <button 
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
      >
        Guardar Nota
      </button>
    </form>
  );
}