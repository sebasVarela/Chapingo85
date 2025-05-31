'use server';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from "next/navigation";
import { z } from "zod";
import { deprecate } from "util";

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; 

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("Error: Faltan variables de entorno de Cloudflare R2. Verifica tu archivo .env.local");
}

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

// NUEVA SERVER ACTION
export async function generatePresignedUrl(userId: string, fileType: string, fileName: string) {
  if (!userId) {
    return { error: "Usuario no autenticado." };
  }
  if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) { // Verificación rápida
      return { error: "Configuración de R2 incompleta en el servidor." };
  }

  const fileExtension = fileName.split('.').pop() || 'jpg';
  const objectKey = `profiles/${userId}/${randomUUID()}.${fileExtension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: fileType,
      // ACL: 'public-read', // R2 maneja la publicidad a nivel de bucket o con URLs firmadas para GETs si es privado
    });

    const presignedUrl = await getSignedUrl(R2, command, { expiresIn: 300 }); // URL válida por 5 minutos

    // Construir la URL pública final de la imagen
    // Asegúrate de que R2_PUBLIC_URL no termine con una barra '/'
    const publicImageUrl = `${R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL}/${objectKey}`;

    return { success: { presignedUrl, publicImageUrl, objectKey } };
  } catch (e) {
    console.error("Error generando URL pre-firmada:", e);
    return { error: "No se pudo generar la URL para la subida." };
  }
}

const ProfileSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio."),
  lastName: z.string().trim().min(1, "El apellido es obligatorio."),
  nickname: z.string().trim().optional(),
  date_of_birth: z.string().min(1, "La fecha de nacimiento es obligatoria."), // Zod tratará el input date como string
  phone_number: z.string().trim().min(1, "El teléfono es obligatorio."),
  about_me: z.string().trim().min(1, "El campo 'Más sobre mí' es obligatorio."),
  profile_photo_url_from_client: z.string().url("URL de foto de perfil inválida o faltante.").min(1, "La foto de perfil es obligatoria."),
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
    profile_photo_url_from_client: formData.get('profile_photo_url_from_client') as string,
  };

  const parsed = ProfileSchema.safeParse(rawFormData);

  if (!parsed.success) {
    let errorMessage = "Datos de perfil inválidos.";
    if (parsed.error.issues.length > 0) {
        errorMessage = parsed.error.issues.map(issue => issue.message).join(' ');
    }
    console.error("Profile validation errors:", parsed.error.flatten());
    return redirect(`/completar-perfil?error=${encodeURIComponent(errorMessage)}`);
  }

  const { 
    firstName, 
    lastName, 
    nickname, 
    date_of_birth, 
    phone_number, 
    about_me,
    profile_photo_url_from_client 
  } = parsed.data;

  // Construir el nuevo full_name
  let constructedFullName = `${firstName} ${lastName}`.trim();
  if (nickname) {
    constructedFullName = `${firstName} "${nickname}" ${lastName}`.trim();
  }
  
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
    profile_photo: profile_photo_url_from_client,
  };

  // 1. Insertar en la tabla active_users
  const { error: insertError } = await supabase.from('active_users').insert(profileDataForActiveUsers);

  if (insertError) {
    console.error('Error inserting into active_users:', insertError);
    return redirect(`/completar-perfil?error=${encodeURIComponent(insertError.message)}`);
  }

  // 2. Actualizar auth.users
  const { error: updateUserError } = await supabase.auth.updateUser({
    data: { 
      full_name: constructedFullName, // Añadimos/actualizamos el full_name construido
      phone_number: phone_number, // Actualizamos el número de teléfono
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