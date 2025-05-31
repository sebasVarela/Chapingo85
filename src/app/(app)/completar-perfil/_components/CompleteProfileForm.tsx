'use client';
import type { User } from "@supabase/supabase-js";
import { useState, useEffect, useRef } from "react";
import { completeUserProfile, generatePresignedUrl } from "../actions";

export default function CompleteProfileForm({ user }: { user: User }) {
  const metadata = user.user_metadata;
  const originalCsvFullName = metadata.original_csv_full_name || "No disponible";

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [displayNamePreview, setDisplayNamePreview] = useState('');

  // Estados para la subida de la foto
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let preview = `${firstName} ${lastName}`.trim();
    if (nickname.trim()) {
      preview = `${firstName} "${nickname.trim()}" ${lastName}`.trim();
    }
    setDisplayNamePreview(preview);
  }, [firstName, lastName, nickname]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      setUploadStatus('Archivo seleccionado. Sube la foto.');
      setUploadError('');
      setProfilePhotoUrl(''); // Reseteamos la URL si se cambia el archivo
    }
  };

  const handlePhotoUpload = async () => {
    if (!profilePhotoFile) {
      setUploadError('Por favor, selecciona un archivo primero.');
      return;
    }
    if (!user || !user.id) {
      setUploadError('Error de autenticación, no se puede subir la foto.');
      return;
    }

    setUploadStatus('Generando permiso para subir...');
    setUploadError('');

    try {
      const result = await generatePresignedUrl(user.id, profilePhotoFile.type, profilePhotoFile.name);

      if (result.error || !result.success) {
        setUploadError(result.error || 'No se pudo obtener la URL pre-firmada.');
        setUploadStatus('');
        return;
      }

      setUploadStatus('Permiso obtenido. Subiendo foto a R2...');
      const { presignedUrl, publicImageUrl } = result.success;

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: profilePhotoFile,
        headers: {
          'Content-Type': profilePhotoFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir el archivo a R2. Estado: ' + uploadResponse.status);
      }

      setProfilePhotoUrl(publicImageUrl); // Guardamos la URL pública final
      setUploadStatus('¡Foto subida con éxito!');
      setUploadError('');
      if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Resetea el input file
      }
      setProfilePhotoFile(null); // Limpia el archivo seleccionado

    } catch (e: any) {
      console.error("Error en la subida de foto:", e);
      setUploadError(e.message || 'Ocurrió un error durante la subida.');
      setUploadStatus('');
    }
  };
  
  // Necesitamos interceptar el envío del formulario para asegurar que la URL de la foto esté lista
  async function clientSideSubmit(formData: FormData) {
    if (!profilePhotoUrl) { // Si no hay URL, significa que no se subió foto o falló
      setUploadError("Por favor, sube una foto de perfil o espera a que termine la subida.");
      return; 
    }
    formData.set('profile_photo_url_from_client', profilePhotoUrl); // Añadimos la URL al FormData
    await completeUserProfile(formData); // Llamamos a la server action original
  }

  return (
    <form action={clientSideSubmit} className="space-y-6">
      {originalCsvFullName !== "No disponible" && (
        <div className="p-4 bg-black border border-blue-200 rounded-md">
          <p className="text-sm text-white">
            Esta cuenta se le asignó a <strong className="font-semibold">{originalCsvFullName}</strong>.
            <br/>Ingresa a continuación un nombre y un apellido.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
          <input type="text" name="first_name" id="first_name" required 
            value={firstName} onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Apellido <span className="text-red-500">*</span></label>
          <input type="text" name="last_name" id="last_name" required 
            value={lastName} onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
      
      <div>
        <p className="text-sm text-blue-700">
          <strong className="font-semibold">¿Tenías un apodo en Chapingo?</strong>.
        </p>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">Puedes incluirlo si lo deseas. (Opcional)</label>
        <input type="text" name="nickname" id="nickname" 
          value={nickname} onChange={(e) => setNickname(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>

      {displayNamePreview && (
        <div className="p-3 border border-black rounded-md">
          <p className="text-sm text-gray-600">Así se mostrará tu nombre: <strong className="font-semibold text-indigo-600">{displayNamePreview}</strong></p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento <span className="text-red-500">*</span></label>
          <input type="date" name="date_of_birth" id="date_of_birth" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Teléfono Celular <span className="text-red-500">*</span></label>
          <input type="tel" name="phone_number" id="phone_number" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      {/* SECCIÓN DE FOTO DE PERFIL MODIFICADA */}
      <div>
        <label htmlFor="profile_photo_input" className="block text-sm font-medium text-gray-700">Foto de Perfil <span className="text-red-500">*</span></label>
        <div className="mt-1 flex items-center gap-4">
          <input 
            type="file" 
            id="profile_photo_input" 
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            ref={fileInputRef} // Añadimos la referencia
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
          />
          {profilePhotoFile && (
            <button 
              type="button" 
              onClick={handlePhotoUpload}
              className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Subir Foto
            </button>
          )}
        </div>
        {uploadStatus && <p className="text-sm text-green-600 mt-1">{uploadStatus}</p>}
        {uploadError && <p className="text-sm text-red-600 mt-1">{uploadError}</p>}
        {profilePhotoUrl && <img src={profilePhotoUrl} alt="Vista previa" className="mt-2 h-20 w-20 rounded-full object-cover" />}
      </div>
      {/* Campo oculto para enviar la URL de la foto ya subida */}
      <input type="hidden" name="profile_photo_url_from_client" value={profilePhotoUrl} />

      <div>
        <label htmlFor="about_me" className="block text-sm font-medium text-gray-700">Más sobre mí <span className="text-red-500">*</span></label>
        <textarea name="about_me" id="about_me" rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
      </div>

      <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Finalizar Registro
      </button>
    </form>
  );
}