'use client';
import { cancelRegistrationByOrganizer } from "../actions";

export default function CancelRegistrationForm({ 
  registrationId,
  onSuccess
}: { 
  registrationId: string,
  onSuccess?: () => void 
}) {

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Prevenir el envío tradicional
    if (!confirm('¿Estás seguro de que quieres cancelar esta inscripción? Esta acción no se puede deshacer.')) {
      return;
    }
    
    const formData = new FormData(event.currentTarget);
    await cancelRegistrationByOrganizer(formData);
    
    if (onSuccess) {
      onSuccess(); // Llamar a la función de recarga de datos
    }
  }

  return (
    // Cambiamos action por onSubmit
    <form onSubmit={handleSubmit}> 
      <input type="hidden" name="registration_id" value={registrationId} />
      <button 
        type="submit"
        className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Cancelar
      </button>
    </form>
  );
}