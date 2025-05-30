import LoginViewManager from './_components/LoginViewManager';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Chapingo 85
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Bienvenido(a) de nuevo
        </p>
        <div className="bg-white p-8 rounded-xl shadow-md">
          <LoginViewManager />
        </div>
        <p className="text-xs text-center text-gray-500 mt-6">
          © 2025 Comité Organizador Chapingo 85. Todos los derechos reservados.
        </p>
      </div>
    </main>
  );
}