import Link from 'next/link';
import Image from 'next/image';
import type { ActiveUser } from '../page';

export default function UserCard({ user }: { user: ActiveUser }) {
  const imageWidth = 250;
  const imageHeight = 192;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl flex flex-col">
      <div className="relative h-48 w-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {user.profile_photo ? (
          <Image 
            src={user.profile_photo} 
            alt={`Foto de perfil de ${user.full_name}`}
            width={imageWidth}
            height={imageHeight}  
            className="object-cover" // object-cover asegura que la imagen cubra el área sin distorsionarse
            priority={true}
          />
        ) : (
          <span className="text-6xl text-gray-400">👤</span> // Placeholder si no hay foto
        )}
      </div>
      <div className="p-4 text-center flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">{user.full_name}</h3>
          <p className="text-sm text-gray-500 mb-3">{user.department}</p>
        </div>
        <Link 
          href={`/perfil/${user.id}`}
          className="mt-auto inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Ver Perfil
        </Link>
      </div>
    </div>
  );
}