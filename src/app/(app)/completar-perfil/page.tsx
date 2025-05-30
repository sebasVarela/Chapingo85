import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CompleteProfileForm from './_components/CompleteProfileForm';

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/login');
  }

  const user = data.user;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          ¡Un último paso!
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Completa tu perfil para finalizar tu registro.
        </p>
        <div className="bg-white p-8 rounded-xl shadow-md">
          <CompleteProfileForm user={user} />
        </div>
      </div>
    </main>
  );
}