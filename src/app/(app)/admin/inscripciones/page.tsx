'use client'; 

import { useState, useEffect, useCallback } from "react"; 
import { createClient } from "@/lib/supabase/client"; 
import UpdateAmountPaidForm from "./_components/UpdateAmountPaidForm";
import CancelRegistrationForm from "./_components/CancelRegistrationForm";
import SummaryBar from "./_components/SummaryBar";
import Modal from "./_components/Modal";
import UpdateNotesForm from "./_components/UpdateNotesForm";
import ReactivateRegistrationForm from "./_components/ReactivateRegistrationForm";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalType, setModalType] = useState<null | 'amountPaid' | 'notes'>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationDetails | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) {
      setIsLoading(true);
    }
    setIsRefreshing(true);
    setError(null);
    console.log("fetchData: Iniciando obtención de datos...");

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("fetchData: Error obteniendo usuario o no hay usuario", userError);
      window.location.href = '/login';
      return;
    }
    console.log("fetchData: User ID:", user.id);

    let currentDepartment = organizerDepartment;
    if (!currentDepartment) {
        const { data: profile, error: profileError_fetch } = await supabase // Renombré profileError para evitar conflicto
            .from('active_users')
            .select('is_organizer, department')
            .eq('id', user.id)
            .single();

        console.log("fetchData: Perfil del organizador obtenido:", profile);
        if (profileError_fetch || !profile?.is_organizer) {
            console.error("fetchData: Error obteniendo perfil o no es organizador:", profileError_fetch);
            setError("Acceso Denegado. No tienes permisos o hubo un error de perfil.");
            setIsLoading(false);
            setIsRefreshing(false);
            return;
        }
        setOrganizerDepartment(profile.department);
        currentDepartment = profile.department;
    }
    
    if (!currentDepartment) {
        console.error("fetchData: No se pudo determinar el departamento del organizador.");
        setError("No se pudo determinar el departamento del organizador.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
    }
    console.log("fetchData: Departamento para RPCs:", currentDepartment);

    const [regsData, statsData] = await Promise.all([
      supabase.rpc('get_all_registrations_with_details', { organizer_department: currentDepartment }),
      supabase.rpc('get_department_stats', { p_department: currentDepartment }).single()
    ]);

    console.log("fetchData: Respuesta RPC (registrations):", regsData);
    console.log("fetchData: Número de registros recibidos:", regsData.data?.length);
    console.log("fetchData: Respuesta RPC (stats):", statsData);

    if (regsData.error || statsData.error) {
      const errorMessage = regsData.error?.message || statsData.error?.message || "Error al cargar datos.";
      console.error("fetchData: Error en RPCs:", errorMessage);
      setError(errorMessage);
    } else {
      setRegistrations(regsData.data as RegistrationDetails[]);
      setStats(statsData.data as Stats);
      console.log("fetchData: Datos actualizados en el estado.");
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, [supabase, organizerDepartment]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const handleOpenModal = (type: 'amountPaid' | 'notes', reg: RegistrationDetails) => { setSelectedRegistration(reg); setModalType(type); };
  
  // --- FUNCIÓN PARA ACTUALIZAR UNA SOLA INSCRIPCIÓN EN EL ESTADO ---
  const handleRegistrationUpdate = (updatedRegistration: RegistrationDetails) => {
    setRegistrations(prevRegs =>
      prevRegs.map(reg =>
        reg.id === updatedRegistration.id ? { ...reg, ...updatedRegistration } : reg
      )
    );
    // Opcional: Recargar estadísticas silenciosamente si una actualización de fila puede afectarlas
    // Por ejemplo, si amount_paid cambia, las estadísticas de recaudado/pendiente cambian.
    fetchData(true); // Esto recargará todo, incluyendo la fila y las estadísticas.
    // Si la `updatedRegistration` que devuelve la action ya es completa (con datos de `active_users`),
    // podrías evitar el fetchData completo si el único impacto es en las stats, y recalcular stats localmente.
    // Por ahora, un fetchData silencioso es más simple.
    
    if (modalType) { // Cierra el modal si la actualización vino de un modal
        setModalType(null);
        setSelectedRegistration(null);
    }
  };

  if (isLoading) { return <main className="min-h-screen bg-gray-100 p-8 text-center"><p>Cargando datos...</p></main>; }
  if (error && !organizerDepartment) { return ( <main className="min-h-screen bg-gray-100 p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Error</h1><p className="text-gray-700 mt-2">{error}</p></main> );}


  return (
    <>
      <main className={`min-h-screen bg-gray-100 p-4 sm:p-6 pb-32 transition-opacity duration-300 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
        {/* ... (resto del JSX de la página) ... */}
        {/* En la tabla, al renderizar UpdateAmountPaidForm dentro del Modal: */}
        {/* ... */}
      </main>

      {modalType && selectedRegistration && ( 
        <Modal 
          isOpen={!!modalType} 
          onClose={() => { setModalType(null); setSelectedRegistration(null); }}
          title={modalType === 'amountPaid' ? 'Actualizar Monto Abonado' : 'Gestionar Notas para el Egresado'}
        > 
          {modalType === 'amountPaid' && ( 
            <UpdateAmountPaidForm 
              registrationId={selectedRegistration.id} 
              currentAmount={selectedRegistration.amount_paid} 
              onActionComplete={(updatedReg) => { // Actualizado para usar la nueva función
                handleRegistrationUpdate(updatedReg as RegistrationDetails);
                // El modal se cierra en handleRegistrationUpdate o aquí si prefieres:
                // setModalType(null); setSelectedRegistration(null); 
              }}
            /> 
          )} 
          {/* ... (Formulario de notas necesitará un patrón similar) ... */}
          {modalType === 'notes' && ( <UpdateNotesForm registrationId={selectedRegistration.id} currentNotes={selectedRegistration.organizer_notes ?? ''} onActionComplete={ (updatedReg) => { handleRegistrationUpdate(updatedReg as RegistrationDetails);}} /> )}
        </Modal> 
      )}
      {stats && <SummaryBar stats={stats} />}
    </>
  );
  
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
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">Egresado</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">Contacto</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">Monto</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">Abonado</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">Estado</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">Notas</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((reg) => {
                  const isPaid = Number(reg.amount_paid) >= Number(reg.total_to_pay);
                  const isCancelled = reg.payment_status === 'cancelado';
                  const rowClass = isCancelled ? 'bg-red-50 opacity-70 hover:opacity-90' : 'hover:bg-gray-50';

                  return (
                    <tr key={reg.id} className={rowClass}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.full_name}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{reg.email}<br/>{reg.phone_number}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${Number(reg.total_to_pay).toLocaleString('es-MX')}</td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {isCancelled ? 
                          <span className="text-sm text-gray-500">${Number(reg.amount_paid).toLocaleString('es-MX')}</span> 
                        : 
                          <button onClick={() => handleOpenModal('amountPaid', reg)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            ${Number(reg.amount_paid).toLocaleString('es-MX')} (Editar)
                          </button>
                        }
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {isCancelled ? 
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-red-800">Cancelado</span> 
                        : isPaid ? 
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pagado</span> 
                        : 
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Sin Liquidar</span>
                        }
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {isCancelled ? 
                          <span className="text-xs text-gray-400">N/A</span> 
                        : 
                          <button onClick={() => handleOpenModal('notes', reg)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">{reg.organizer_notes ? 'Ver/Editar' : 'Añadir Nota'}</button>}</td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {isCancelled ? (
                          <ReactivateRegistrationForm registrationId={reg.id} onSuccess={fetchData} />
                        ) : (
                          <CancelRegistrationForm registrationId={reg.id} onSuccess={fetchData} />
                        )}
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
          onClose={() => { setModalType(null); setSelectedRegistration(null); }} // Simplemente cierra, la recarga la hace el form
          title={modalType === 'amountPaid' ? 'Actualizar Monto Abonado' : 'Gestionar Notas para el Egresado'}
        > 
          {modalType === 'amountPaid' && selectedRegistration && ( // Añadimos selectedRegistration aquí también
            <UpdateAmountPaidForm 
              registrationId={selectedRegistration!.id} 
              currentAmount={selectedRegistration!.amount_paid} 
              onActionComplete={(updatedReg) => {
                handleRegistrationUpdate(updatedReg as RegistrationDetails);
              }}
            /> 
          )} 
          {modalType === 'notes' && selectedRegistration && ( // Añadimos selectedRegistration aquí también
            <UpdateNotesForm 
              registrationId={selectedRegistration!.id} 
              currentNotes={selectedRegistration!.organizer_notes ?? ''} 
              onActionComplete={(updatedReg) => {
                handleRegistrationUpdate(updatedReg as RegistrationDetails);
              }}
            /> 
          )}
        </Modal> 
      )}
      
      {stats && <SummaryBar stats={stats} />}
    </>
  );
}