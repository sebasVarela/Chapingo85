// en scripts/delete-all-user-data.ts

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
// Para dotenv, si usas "import dotenv from 'dotenv';", el "require" equivalente es:
const dotenv = require('dotenv'); // o simplemente require('dotenv').config(...) si no necesitas la variable 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Validar que las variables de entorno estén cargadas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL or Service Role Key is not defined in .env.local');
}

// Crear cliente de Supabase con la service_role key y tu nuevo nombre de variable
const supabaseAdminDelete = createClient( // <-- Usando tu nuevo nombre
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteAllUserData() {
  console.log('ADVERTENCIA: Este script eliminará todos los datos de usuarios.');
  console.log('Presiona Ctrl+C en los próximos 5 segundos si quieres cancelar.');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Iniciando proceso de eliminación...');

  // 1. Eliminar de event_registrations
  console.log('Eliminando inscripciones de eventos...');
  const { error: eventRegError } = await supabaseAdminDelete // <-- Usando tu nuevo nombre
    .from('event_registrations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (eventRegError) {
    console.error('Error eliminando event_registrations:', eventRegError.message);
  } else {
    console.log('Inscripciones de eventos eliminadas.');
  }

  // 2. Eliminar de active_users
  console.log('Eliminando perfiles de usuarios activos...');
  const { error: activeUsersError } = await supabaseAdminDelete // <-- Usando tu nuevo nombre
    .from('active_users')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (activeUsersError) {
    console.error('Error eliminando active_users:', activeUsersError.message);
  } else {
    console.log('Perfiles de usuarios activos eliminados.');
  }

  // 3. Eliminar usuarios de auth.users
  console.log('Obteniendo lista de usuarios de Supabase Auth...');
  const { data: users, error: listUsersError } = await supabaseAdminDelete.auth.admin.listUsers({ // <-- Usando tu nuevo nombre
    page: 1,
    perPage: 1000,
  });

  if (listUsersError) {
    console.error('Error obteniendo lista de usuarios de Auth:', listUsersError.message);
  } else if (users && users.users.length > 0) {
    console.log(`Se encontraron ${users.users.length} usuarios en Supabase Auth. Eliminándolos...`);
    for (const user of users.users) {
      const { error: deleteUserError } = await supabaseAdminDelete.auth.admin.deleteUser(user.id); // <-- Usando tu nuevo nombre
      if (deleteUserError) {
        console.error(`Error eliminando usuario ${user.id} de Auth:`, deleteUserError.message);
      } else {
        console.log(`Usuario ${user.id} eliminado de Auth.`);
      }
    }
    console.log('Usuarios de Supabase Auth eliminados.');
  } else {
    console.log('No se encontraron usuarios en Supabase Auth para eliminar.');
  }

  // 4. Eliminar de pending_users
  console.log('Eliminando usuarios pendientes...');
  const { error: pendingUsersError } = await supabaseAdminDelete // <-- Usando tu nuevo nombre
    .from('pending_users')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (pendingUsersError) {
    console.error('Error eliminando pending_users:', pendingUsersError.message);
  } else {
    console.log('Usuarios pendientes eliminados.');
  }

  console.log('¡Proceso de eliminación completado!');
}

deleteAllUserData().catch(error => {
  console.error('Error general en el script:', error);
});