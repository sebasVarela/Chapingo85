export default function RegistrationSummary({ registration }: { registration: any }) {
  const totalPeople = 1 + registration.number_of_guests;

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-bold text-green-600">¡Gracias por registrarte!</h2>

      <p className="text-gray-700">Estos son los detalles de tu inscripción.</p>
      
      <div className="border-t border-b border-gray-200 py-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="text-left">
            <dt className="text-sm font-medium text-gray-500">Asistentes Totales</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">{totalPeople} {totalPeople > 1 ? 'personas' : 'persona'}</dd>
          </div>
          <div className="text-left">
            <dt className="text-sm font-medium text-gray-500">Vehículos Registrados</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">{registration.number_of_vehicles}</dd>
          </div>
          <div className="text-left">
            <dt className="text-sm font-medium text-gray-500">Estado del Pago</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900 capitalize bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full inline-block">{registration.payment_status}</dd>
          </div>
          <div className="text-left">
            <dt className="text-sm font-medium text-gray-500">Monto Total a Pagar</dt>
            <dd className="mt-1 text-lg font-semibold text-indigo-600">${Number(registration.total_to_pay).toLocaleString('es-MX')} MXN</dd>
          </div>
        </dl>
      </div>

      <p className="text-sm text-gray-600 pt-4">
        Pronto un organizador se pondrá en contacto contigo para coordinar el pago.
      </p>

      {registration.organizer_notes && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Aviso del Comité Organizador</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>{registration.organizer_notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}