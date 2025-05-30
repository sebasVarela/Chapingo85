'use client';
import { cancelRegistrationByOrganizer } from "../actions";

export default function CancelRegistrationForm({ registrationId }: { registrationId: string }) {
  return (
    <form action={cancelRegistrationByOrganizer}>
      <input type="hidden" name="registration_id" value={registrationId} />
      <button 
        type="submit"
        onClick={(e) => !confirm('¿Estás seguro de que quieres cancelar esta inscripción? Esta acción no se puede deshacer.') && e.preventDefault()}
        className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Cancelar
      </button>
    </form>
  );
}