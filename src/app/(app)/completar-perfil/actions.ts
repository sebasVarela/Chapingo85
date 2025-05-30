'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from "next/navigation";
import { z } from "zod";

const ProfileSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio."),
  lastName: z.string().trim().min(1, "El apellido es obligatorio."),
  nickname: z.string().trim().optional(),
  date_of_birth: z.string().min(1, "La fecha de nacimiento es obligatoria."), // Zod tratará el input date como string
  phone_number: z.string().trim().min(1, "El teléfono es obligatorio."),
  about_me: z.string().trim().min(1, "El campo 'Más sobre mí' es obligatorio."),
  // profile_photo: // La validación de archivos es más compleja, la omitimos por ahora
});

export async function completeUserProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login?error=User not found');
  }

  const rawFormData = {
    firstName: formData.get('first_name') as string,
    lastName: formData.get('last_name') as string,
    nickname: formData.get('nickname') as string,
    date_of_birth: formData.get('date_of_birth') as string,
    phone_number: formData.get('phone_number') as string,
    about_me: formData.get('about_me') as string,
  };

  const parsed = ProfileSchema.safeParse(rawFormData);

  if (!parsed.success) {
    let errorMessage = "Datos de perfil inválidos.";
    if (parsed.error.issues.length > 0) {
        errorMessage = parsed.error.issues.map(issue => issue.message).join(' ');
    }
    return redirect(`/completar-perfil?error=${encodeURIComponent(errorMessage)}`);
  }

  const { firstName, lastName, nickname, date_of_birth, phone_number, about_me } = parsed.data;

  // Construir el nuevo full_name
  let constructedFullName = `${firstName} ${lastName}`.trim();
  if (nickname) {
    constructedFullName = `${firstName} "${nickname}" ${lastName}`.trim();
  }

  // NOTA: La subida de la foto de perfil (formData.get('profile_photo'))
  // se manejará en un paso futuro cuando integremos Cloudflare R2.
  // Por ahora, usaremos una URL temporal.
  
  const profileDataForActiveUsers = {
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    nickname: nickname || null,
    full_name: constructedFullName,
    department: user.user_metadata.department,
    gender: user.user_metadata.gender,
    date_of_birth: date_of_birth,
    phone_number: phone_number,
    about_me: about_me,
    profile_photo: 'https://example.com/avatar.png', // URL Temporal
  };

  // 1. Insertar en la tabla active_users
  const { error: insertError } = await supabase.from('active_users').insert(profileDataForActiveUsers);

  if (insertError) {
    console.error('Error inserting into active_users:', insertError);
    return redirect(`/completar-perfil?error=${encodeURIComponent(insertError.message)}`);
  }

  // 2. Actualizar auth.users
  const { error: updateUserError } = await supabase.auth.updateUser({
    phone: phone_number, // Actualiza el teléfono en auth.users
    data: { 
      ...user.user_metadata, // Mantenemos la metadata existente
      full_name: constructedFullName, // Añadimos/actualizamos el full_name construido
    }
  });

  if (updateUserError) {
    console.error('Error updating user in auth.users (non-critical):', updateUserError.message);
  }

  // 3. Eliminar de la tabla pending_users usando el cliente admin
  const pendingIdToDelete = user.user_metadata.pending_id;
  if (pendingIdToDelete) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error: deleteError } = await supabaseAdmin
      .from('pending_users')
      .delete()
      .eq('id', pendingIdToDelete);
      
    if (deleteError) {
      console.error('Error deleting from pending_users (non-critical):', deleteError);
    }
  }

  // 4. Redirigir al directorio principal de la aplicación
  return redirect('/directorio');
}