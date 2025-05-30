'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const VerifySchema = z.object({
  // fullName: z.string().trim().toUpperCase(), // Se elimina fullName
  department: z.string(),
  activationCode: z.string().trim()
});

export async function verifyPendingUser(formData: FormData) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // CAMBIO: Actualizar rawFormData
  const rawFormData = {
    // fullName: formData.get('full_name') as string, // Se elimina fullName
    department: formData.get('department') as string,
    activationCode: formData.get('activation_code') as string,
  };

  const parsed = VerifySchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { error: 'Datos de formulario inválidos. Asegúrate de seleccionar departamento e ingresar el código.' };
  }
  
  // CAMBIO: Actualizar la desestructuración
  const { department, activationCode } = parsed.data;

  // CAMBIO: Actualizar la consulta a Supabase
  const { data, error } = await supabaseAdmin
    .from('pending_users')
    .select('id') // Solo necesitamos el id para el siguiente paso
    // .eq('full_name', fullName) // Se elimina la condición de fullName
    .eq('department', department)
    .eq('activation_code', activationCode)
    .single();

  if (error || !data) {
    return { error: 'Los datos no coinciden. Por favor, verifica tu departamento y código.' };
  }

  return { pendingUserId: data.id };
}



// --- La función signUpUser ahora es más potente ---

const SignUpSchema = z.object({
  email: z.string().email("Correo electrónico inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  pendingUserId: z.string().uuid(),
});

export async function signUpUser(formData: FormData) {
  const supabase = await createClient();

  const parsed = SignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    pendingUserId: formData.get('pendingUserId'),
  });

  if (!parsed.success) {
    let errorMessage = "Datos de registro inválidos.";
    if (parsed.error.issues.length > 0) {
        errorMessage = parsed.error.issues.map(issue => issue.message).join(' ');
    }
    return redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
  }

  const { email, password, pendingUserId } = parsed.data;
  
  // Usamos el cliente admin para obtener los datos del usuario pendiente
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: pendingData, error: pendingError } = await supabaseAdmin
    .from('pending_users')
    .select('full_name, department, gender')
    .eq('id', pendingUserId)
    .single();

  if (pendingError || !pendingData) {
    return redirect(`/login?error=${encodeURIComponent("No se pudo encontrar el registro pendiente para asociar.")}`);
  }

  // Registramos al usuario y pasamos sus datos originales en la metadata
  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        original_csv_full_name: pendingData.full_name,
        department: pendingData.department,
        gender: pendingData.gender,
        pending_id: pendingUserId
      }
    }
  });

  if (authError) {
    return redirect(`/login?error=${encodeURIComponent(authError.message)}`);
  }

  // Redirigimos a la página para completar el perfil
  return redirect('/completar-perfil');
}

const SignInSchema = z.object({
  email: z.string().email("Correo electrónico inválido."),
  password: z.string().min(1, "La contraseña no puede estar vacía."),
});

export async function signIn(formData: FormData) {
  const parsed = SignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return redirect('/login?error=Por favor, ingresa un correo y contraseña válidos.');
  }

  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("Sign-in Error:", authError.message);
    return redirect(`/login?error=${encodeURIComponent("Credenciales inválidas. Por favor, intenta de nuevo.")}`);
  }

  if (!authData.user) {
    // Esto no debería suceder si no hay error, pero es una buena práctica verificarlo.
    console.error("Sign-in Error: User object is null after successful sign-in.");
    return redirect(`/login?error=${encodeURIComponent("Ocurrió un error inesperado durante el inicio de sesión.")}`);
  }

  const userId = authData.user.id;

  // Verificar si el perfil del usuario está completo en la tabla active_users
  const { data: activeUser, error: activeUserError } = await supabase
    .from('active_users')
    .select('id')
    .eq('id', userId)
    .limit(1)
    .single(); // Usamos single() ya que esperamos 0 o 1 fila

  if (activeUserError || !activeUser) {
    // Si hay un error consultando active_users o el usuario no se encuentra (perfil incompleto)
    // redirigir a completar perfil.
    // Podrías querer loggear activeUserError si existe, para depuración.
    if (activeUserError && activeUserError.code !== 'PGRST116') { // PGRST116: 'No rows found'
        console.error("Error querying active_users:", activeUserError.message);
    }
    return redirect('/completar-perfil');
  }

  // Si el inicio de sesión es exitoso y el perfil está completo, revalidamos y redirigimos
  revalidatePath('/', 'layout');
  redirect('/directorio');
}

