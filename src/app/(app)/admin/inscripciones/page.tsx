'use client'; 

import { useState, useEffect } from "react"; // <-- Importar hooks
import { createClient } from "@/lib/supabase/client"; // <-- Usar cliente de navegador para llamadas iniciales
import UpdateAmountPaidForm from "./_components/UpdateAmountPaidForm";
import CancelRegistrationForm from "./_components/CancelRegistrationForm";
import SummaryBar from "./_components/SummaryBar";
import Modal from "./_components/Modal"; // <-- Importar Modal
import UpdateNotesForm from "./_components/UpdateNotesForm"; // <-- Importar formulario de notas

// El tipo ahora refleja la salida de nuestra función RPC
type RegistrationDetails = {
  id: string;
  total_to_pay: number;
  payment_status: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  amount_paid: number;
  organizer_notes: string | null;
};

type Stats = { // Definimos el tipo para las estadísticas
  total_inscripciones: number;
  inscripciones_activas: number;
  inscripciones_canceladas: number;
  total_asistentes: number;
  total_recaudado: number;
  total_pendiente: number;
};

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationDetails[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [organizerDepartment, setOrganizerDepartment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalType, setModalType] = useState<null | 'amountPaid' | 'notes'>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationDetails | null>(null);

  const supabase = createClient(); // Cliente del navegador

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login'; // Redirección en cliente
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('active_users')
        .select('is_organizer, department')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.is_organizer) {
        setError("Acceso Denegado. No tienes permisos.");
        setIsLoading(false);
        return;
      }
      setOrganizerDepartment(profile.department);

      const [regsData, statsData] = await Promise.all([
        supabase.rpc('get_all_registrations_with_details', { organizer_department: profile.department }),
        supabase.rpc('get_department_stats', { p_department: profile.department }).single()
      ]);

      if (regsData.error || statsData.error) {
        setError(regsData.error?.message || statsData.error?.message || "Error al cargar datos.");
      } else {
        setRegistrations(regsData.data as RegistrationDetails[]);
        setStats(statsData.data as Stats);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [supabase]); // Volver a ejecutar si supabase cambia (aunque no debería)

  const handleOpenModal = (type: 'amountPaid' | 'notes', reg: RegistrationDetails) => {
    setSelectedRegistration(reg);
    setModalType(type);
  };

  const handleCloseModal = async () => {
    setModalType(null);
    setSelectedRegistration(null);
    // Forzar recarga de datos después de cerrar un modal y una acción
    setIsLoading(true);
     const { data: profile } = await supabase.from('active_users').select('department').eq('id', (await supabase.auth.getUser()).data.user!.id).single();
     if(profile?.department) {
        const [regsData, statsData] = await Promise.all([
            supabase.rpc('get_all_registrations_with_details', { organizer_department: profile.department }),
            supabase.rpc('get_department_stats', { p_department: profile.department }).single()
        ]);
        setRegistrations(regsData.data as RegistrationDetails[]);
        setStats(statsData.data as Stats);
     }
    setIsLoading(false);
  };

  if (isLoading) {
    return <main className="min-h-screen bg-gray-100 p-8 text-center"><p>Cargando datos...</p></main>;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-700 mt-2">{error}</p>
      </main>
    );
  }
  
  return (
    <>
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6 pb-32">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Inscripciones</h1>
          <h2 className="text-lg text-gray-600 mt-2">{organizerDepartment}</h2>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Egresado</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abonado</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((reg) => {
                  const isPaid = Number(reg.amount_paid) >= Number(reg.total_to_pay);
                  const isCancelled = reg.payment_status === 'cancelado';
                  const rowClass = isCancelled ? 'bg-red-50 opacity-60' : '';

                  return (
                    <tr key={reg.id} className={rowClass}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.full_name}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{reg.email}<br/>{reg.phone_number}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">${Number(reg.total_to_pay).toLocaleString('es-MX')}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isCancelled ? `$${Number(reg.amount_paid).toLocaleString('es-MX')}` : (
                          <button onClick={() => handleOpenModal('amountPaid', reg)} className="text-gray-900 hover:text-indigo-900 text-sm font-medium">
                            ${Number(reg.amount_paid).toLocaleString('es-MX')}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {isCancelled ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelado</span> : isPaid ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pagado</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Sin Liquidar</span>}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <button onClick={() => handleOpenModal('notes', reg)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          {reg.organizer_notes ? 'Ver/Editar' : 'Añadir Nota'}
                        </button>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {!isCancelled && <CancelRegistrationForm registrationId={reg.id} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modalType && selectedRegistration && (
        <Modal
          isOpen={!!modalType}
          onClose={handleCloseModal}
          title={modalType === 'amountPaid' ? 'Monto abonado' : 'Enviar nota'}
        >
          {modalType === 'amountPaid' && (
            <UpdateAmountPaidForm
              registrationId={selectedRegistration.id}
              currentAmount={selectedRegistration.amount_paid}
              onSuccess={handleCloseModal}
            />
          )}
          {modalType === 'notes' && (
            <UpdateNotesForm
              registrationId={selectedRegistration.id}
              currentNotes={selectedRegistration.organizer_notes ?? ''}
              onSuccess={handleCloseModal}
            />
          )}
        </Modal>
      )}
      
      {stats && <SummaryBar stats={stats} />}
    </>
  );
}