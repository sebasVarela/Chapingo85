'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function registerForEvent(formData: FormData) {
  const supabase = await createClient();

  const registrationData = {
    user_id: formData.get('user_id') as string,
    number_of_guests: parseInt(formData.get('number_of_guests') as string, 10),
    total_to_pay: parseFloat(formData.get('total_to_pay') as string),
    attending_with_vehicle: formData.get('attending_with_vehicle') === 'on',
    number_of_vehicles: parseInt(formData.get('number_of_vehicles') as string, 10) || 0,
  };

  const { error } = await supabase.from('event_registrations').insert(registrationData);

  if (error) {
    console.error("Error al registrar asistencia:", error);
    // Podríamos redirigir a una página de error en el futuro
    return;
  }

  // Limpiamos la caché de la página del evento para que se vuelva a renderizar
  // y muestre el resumen en lugar del formulario.
  revalidatePath('/evento');
  redirect('/evento');
}