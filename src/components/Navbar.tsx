// en src/components/Navbar.tsx

import Link from "next/link";
import { signOut } from "@/app/actions";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Links de Navegación */}
          <div className="flex items-center space-x-8">
            <Link href="/directorio" className="font-bold text-xl text-indigo-600">
              Chapingo 85
            </Link>
            <div className="hidden md:flex md:space-x-8">
              <Link href="/directorio" className="text-gray-500 hover:text-gray-900 font-medium">
                Directorio
              </Link>
              <Link href="/evento" className="text-gray-500 hover:text-gray-900 font-medium">
                Inscripción al Evento
              </Link>
              {/* Aquí podríamos añadir un link a /admin si el usuario es organizador */}
            </div>
          </div>

          {/* Botón de Cerrar Sesión */}
          <div className="flex items-center">
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}