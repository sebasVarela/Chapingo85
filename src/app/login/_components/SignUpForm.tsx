'use client';

import { signUpUser } from '../actions';

type SignUpFormProps = {
  pendingUserId: string;
};

export default function SignUpForm({ pendingUserId }: SignUpFormProps) {
  
  // La función 'signUpUser' se encargará de todo.
  // En el futuro, añadiremos manejo de estado para errores o éxito.
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-4">Crear tu Cuenta</h2>
      <p className="text-sm text-center text-gray-600 mb-6">
        Tu identidad ha sido verificada. Ahora, por favor, crea tus credenciales de acceso.
      </p>
      <form action={signUpUser} className="space-y-6">
        {/* Campo oculto para pasar el ID del usuario pendiente */}
        <input type="hidden" name="pendingUserId" value={pendingUserId} />

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Crear Cuenta y Continuar
        </button>
      </form>
    </div>
  );
}