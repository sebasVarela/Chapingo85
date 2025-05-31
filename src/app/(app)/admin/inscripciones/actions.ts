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

export async function reactivateRegistrationByOrganizer(formData: FormData) {
  await checkOrganizer(); // Asegura que solo un organizador pueda hacer esto
  const supabase = await createClient();
  
  const registrationId = formData.get('registration_id') as string;
  if (!registrationId) {
    console.error("Error: registration_id no proporcionado para reactivar.");
    // Considera devolver un error al cliente si es necesario
    return;
  }

  // Primero, obtenemos los datos actuales de la inscripción para decidir el nuevo estado
  const { data: registration, error: fetchError } = await supabase
    .from('event_registrations')
    .select('amount_paid, total_to_pay')
    .eq('id', registrationId)
    .single();

  if (fetchError || !registration) {
    console.error("Error al obtener datos de la inscripción para reactivar:", fetchError?.message);
    return;
  }
  
  let newPaymentStatus = 'pendiente';
  if (Number(registration.amount_paid) >= Number(registration.total_to_pay)) {
    newPaymentStatus = 'pagado';
  }

  const { error: updateError } = await supabase
    .from('event_registrations')
    .update({ payment_status: newPaymentStatus })
    .eq('id', registrationId);
  
  if (updateError) {
    console.error("Error al reactivar inscripción:", updateError.message);
    return;
  }

  revalidatePath('/admin/inscripciones');
}

type ActionResponseState = {
  success: boolean;
  message?: string;
  updatedRegistration?: any;
};

export async function updateAmountPaid(
  prevState: ActionResponseState | undefined, // para useFormState
  formData: FormData
): Promise<ActionResponseState> {
  try {
    await checkOrganizer();
    const supabase = await createClient();

    const registrationId = formData.get('registration_id') as string;
    const newAmountStr = formData.get('new_amount') as string;

    if (newAmountStr === null || newAmountStr.trim() === '') {
        return { success: false, message: 'El monto abonado no puede estar vacío.' };
    }
    const newAmount = parseFloat(newAmountStr);
    if (isNaN(newAmount) || newAmount < 0) {
        return { success: false, message: 'Monto abonado inválido.' };
    }
    
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ amount_paid: newAmount })
      .eq('id', registrationId)
      .select() // Pedimos que devuelva el registro actualizado
      .single(); // Asumimos que solo actualiza uno

    if (updateError) { 
      console.error("Error al actualizar el abono:", updateError);
      return { success: false, message: updateError.message };
    }

    revalidatePath('/admin/inscripciones'); // Sigue siendo importante para la consistencia a largo plazo

    // Para obtener el registro completo con datos del usuario, llamamos a la RPC
    // o, si la tabla 'event_registrations' ya tiene todo lo que necesitamos para la fila, usamos 'data'
    // Para este ejemplo, asumimos que la tabla 'event_registrations' tiene suficiente
    // Si no, necesitaríamos otra llamada a la RPC get_all_registrations_with_details filtrando por ID
    // o ajustar la RPC para devolver un solo registro.
    // Por simplicidad, vamos a buscar el registro de nuevo con la RPC para obtener todos los detalles.
     const { data: updatedRegData, error: rpcSingleError } = await supabase
        .rpc('get_all_registrations_with_details', { organizer_department: formData.get('organizer_department_for_rpc') as string }) // Necesitaremos pasar el departamento
        .eq('id', registrationId) // Esto no funciona con RPCs que devuelven SETOF.
        .single(); // Esta forma de filtrar RPC no es estándar.
        
    // Mejor: buscar el registro actualizado después del update
    const { data: refreshedRegistration, error: refreshError } = await supabase
        .from('event_registrations') // Asumimos que esta tabla tiene amount_paid
        .select(`
            id, total_to_pay, payment_status, amount_paid, organizer_notes,
            active_users ( full_name, phone_number, email ) 
        `) // Ajusta este select según lo que necesite tu fila
        .eq('id', registrationId)
        .single();

    if (refreshError) {
        console.error("Error refrescando el registro:", refreshError);
        return { success: false, message: "Registro actualizado, pero no se pudo refrescar."}
    }

    return { success: true, updatedRegistration: refreshedRegistration };

  } catch (e: any) {
    return { success: false, message: e.message || "Un error inesperado ocurrió." };
  }
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

export async function updateOrganizerNotes(
  prevState: ActionResponseState | undefined, 
  formData: FormData
): Promise<ActionResponseState> {
  try {
    await checkOrganizer();
    const supabase = await createClient();
    
    const registrationId = formData.get('registration_id') as string;
    const newNotes = formData.get('new_notes') as string;

    if (!registrationId) {
        return { success: false, message: "ID de registro no proporcionado." };
    }

    const { data: updatedRegistration, error: updateError } = await supabase
      .from('event_registrations')
      .update({ organizer_notes: newNotes })
      .eq('id', registrationId)
      .select(`
        id, total_to_pay, payment_status, amount_paid, organizer_notes,
        active_users ( full_name, phone_number, email )
      `) // Ajusta este select según los campos que necesite la fila en la UI
      .single();

    if (updateError) {
      console.error("Error al actualizar la nota:", updateError);
      return { success: false, message: updateError.message };
    }
    
    revalidatePath('/admin/inscripciones');
    return { success: true, updatedRegistration: updatedRegistration };

  } catch (e: any) {
    return { success: false, message: e.message || "Un error inesperado ocurrió al actualizar las notas." };
  }
}