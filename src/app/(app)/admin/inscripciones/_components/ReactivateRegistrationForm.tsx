'use client';
import { reactivateRegistrationByOrganizer } from "../actions";

export default function ReactivateRegistrationForm({ 
  registrationId,
  onSuccess // <-- Nueva prop
}: { 
  registrationId: string,
  onSuccess?: () => void
 }) {

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await reactivateRegistrationByOrganizer(formData);

    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit}> {/* Cambiado action por onSubmit */}
      <input type="hidden" name="registration_id" value={registrationId} />
      <button 
        type="submit"
        className="px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
      >
        Reactivar
      </button>
    </form>
  );
}