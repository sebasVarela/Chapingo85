// en src/app/admin/inscripciones/actions.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Función para verificar permisos de organizador
async function checkOrganizer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  
  const { data: profile } = await supabase.from('active_users').select('is_organizer').eq('id', user.id).single();
  if (!profile?.is_organizer) throw new Error("No autorizado");
}

export async function updateAmountPaid(formData: FormData) {
  await checkOrganizer();
  const supabase = await createClient();

  const registrationId = formData.get('registration_id') as string;
  const newAmount = parseFloat(formData.get('new_amount') as string);
  
  const { error } = await supabase
    .from('event_registrations')
    .update({ amount_paid: newAmount })
    .eq('id', registrationId);

  if (error) { console.error("Error al actualizar el abono:", error); return; }

  revalidatePath('/admin/inscripciones');
}

export async function cancelRegistrationByOrganizer(formData: FormData) {
  await checkOrganizer();
  const supabase = await createClient();
  
  const registrationId = formData.get('registration_id') as string;

  const { error } = await supabase
    .from('event_registrations')
    .update({ payment_status: 'cancelado' })
    .eq('id', registrationId);
  
  if (error) { console.error("Error al cancelar inscripción:", error); return; }

  revalidatePath('/admin/inscripciones');
}

export async function updateOrganizerNotes(formData: FormData) {
  await checkOrganizer(); // Reutilizamos la verificación
  const supabase = await createClient();
  
  const registrationId = formData.get('registration_id') as string;
  const newNotes = formData.get('new_notes') as string;

  const { error } = await supabase
    .from('event_registrations')
    .update({ organizer_notes: newNotes })
    .eq('id', registrationId);

  if (error) {
    console.error("Error al actualizar la nota:", error);
    // Considera devolver un objeto con el error para manejarlo en el cliente si es necesario
    return { error: error.message }; 
  }
  
  revalidatePath('/admin/inscripciones');
  return { success: true }; // Opcional: devolver un estado de éxito
}