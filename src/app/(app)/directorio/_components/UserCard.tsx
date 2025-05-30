import Link from 'next/link';
import type { ActiveUser } from '../page';

export default function UserCard({ user }: { user: ActiveUser }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
      <div className="h-40 bg-gray-200 flex items-center justify-center">
        {/* Usaremos la foto de perfil real cuando implementemos la subida de archivos */}
        <span className="text-5xl">👤</span>
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{user.full_name}</h3>
        <p className="text-sm text-gray-500 mb-4">{user.department}</p>
        <Link 
          href={`/perfil/${user.id}`}
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Ver Perfil
        </Link>
      </div>
    </div>
  );
}