import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import UserCard from './_components/UserCard';

// Definimos un tipo para nuestros usuarios activos para mayor seguridad de tipos
export type ActiveUser = {
  id: string;
  full_name: string;
  department: string;
  profile_photo: string;
  // Añade aquí otros campos que quieras mostrar en la tarjeta
};

async function DirectoryPage() {
  const supabase = await createClient();
  
  // Obtenemos los datos de todos los usuarios activos
  const { data: users, error } = await supabase
    .from('active_users')
    .select('id, full_name, department, profile_photo')
    .order('full_name', { ascending: true });

  if (error) {
    return <p className="text-center text-red-500">Error al cargar el directorio: {error.message}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Directorio de Egresados</h1>
        
        {users.length === 0 ? (
          <p className="text-center text-gray-600">Aún no hay usuarios activos en el directorio.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {users.map((user) => (
              <UserCard key={user.id} user={user as ActiveUser} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default DirectoryPage;