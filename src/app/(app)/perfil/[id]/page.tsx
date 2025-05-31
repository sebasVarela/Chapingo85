import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = await params; 
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('active_users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !user) {
    notFound(); // Muestra la página 404 si el usuario no se encuentra
  }

  const avatarSize = 160;

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative w-40 h-40 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
            {user.profile_photo ? (
              <Image 
                src={user.profile_photo} 
                alt={`Foto de perfil de ${user.full_name}`}
                width={avatarSize}
                height={avatarSize}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-7xl text-gray-400">👤</span>
            )}
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
            <h2 className="text-xl font-medium text-indigo-600">{user.department}</h2>
            {user.current_city && <p className="text-md text-gray-600 mt-2">📍 {user.current_city}</p>}
          </div>
        </div>
        
        <div className="mt-10 border-t border-gray-200 pt-8">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Sobre mí</dt>
              <dd className="mt-1 text-md text-gray-900">{user.about_me}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
              <dd className="mt-1 text-md text-gray-900">{new Date(user.date_of_birth).toLocaleDateString('es-MX', { timeZone: 'UTC' })}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd className="mt-1 text-md text-gray-900">{user.phone_number}</dd>
            </div>
            {user.work_trajectory && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Trayectoria Laboral</dt>
                <dd className="mt-1 text-md text-gray-900 whitespace-pre-wrap">{user.work_trajectory}</dd>
              </div>
            )}
            {user.achievements && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Logros</dt>
                <dd className="mt-1 text-md text-gray-900 whitespace-pre-wrap">{user.achievements}</dd>
              </div>
            )}
            {user.student_sports_discipline && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Disciplina Deportiva Estudiantil</dt>
                <dd className="mt-1 text-md text-gray-900">{user.student_sports_discipline}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </main>
  );
}