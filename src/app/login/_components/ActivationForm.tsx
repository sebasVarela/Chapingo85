'use client';

import { useState } from 'react';
import { verifyPendingUser } from '@/app/login/actions';
import SignUpForm from './SignUpForm';

const departments = [
  "Bosques", "Economía", "Fitotencia", "Industrias", 
  "Irrigación", "Parasitología", "Sociología", "Suelos", 
  "Zonas Áridas", "Zootecnia"
];

type VerificationResult = {
  pendingUserId: string;
} | null;

export default function ActivationForm() { // Renombrado internamente si lo hiciste antes
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult>(null);

  async function clientAction(formData: FormData) {
    const actionResult = await verifyPendingUser(formData);
    if (actionResult?.error) {
      setError(actionResult.error);
      setResult(null);
    } else if (actionResult?.pendingUserId) {
      setError(null);
      setResult({ pendingUserId: actionResult.pendingUserId });
    }
  }

  if (result) {
    return <SignUpForm pendingUserId={result.pendingUserId} />;
  }

  return (
    <form action={clientAction} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* CAMBIO: Se elimina el campo full_name de aquí */}
      
      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
          Departamento de Egreso
        </label>
        <select id="department" name="department" required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">Selecciona tu departamento</option>
          {departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
        </select>
      </div>
      <div>
        <label htmlFor="activation_code" className="block text-sm font-medium text-gray-700">
          Código de Activación
        </label>
        <input id="activation_code" name="activation_code" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Verificar
      </button>
    </form>
  );
}