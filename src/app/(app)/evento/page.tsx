import { createClient } from '@/lib/supabase/server';
import RegistrationForm from './_components/RegistrationForm';
import RegistrationSummary from './_components/RegistrationSummary';

export default async function EventPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Buscamos si ya existe una inscripción para este usuario
  const { data: registration, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  const isAlreadyRegistered = registration !== null;

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Inscripción al Evento de Reencuentro
          </h1>
          <p className="text-center text-gray-500 mb-8">Generación 1985</p>

          {isAlreadyRegistered ? (
            <RegistrationSummary registration={registration} />
          ) : (
            <RegistrationForm userId={user!.id} />
          )}

        </div>
      </div>
    </main>
  );
}