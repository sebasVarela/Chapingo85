'use client';

import { useState } from 'react';
import SignInForm from './SignInForm';
import ActivationForm from './ActivationForm';

export default function LoginViewManager() {
  const [view, setView] = useState<'signIn' | 'activate'>('signIn');

  return (
    <div>
      {view === 'signIn' ? <SignInForm /> : <ActivationForm />}
      <div className="mt-6 text-center">
        <button
          onClick={() => setView(view === 'signIn' ? 'activate' : 'signIn')}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          {view === 'signIn' 
            ? '¿Es tu primera vez? Activa tu cuenta aquí.' 
            : '¿Ya tienes una cuenta? Inicia sesión.'
          }
        </button>
      </div>
    </div>
  );
}