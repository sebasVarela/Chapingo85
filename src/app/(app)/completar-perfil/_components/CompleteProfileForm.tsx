'use client';
import type { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { completeUserProfile } from "../actions";

export default function CompleteProfileForm({ user }: { user: User }) {
  const metadata = user.user_metadata;
  const originalCsvFullName = metadata.original_csv_full_name || "No disponible";

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [displayNamePreview, setDisplayNamePreview] = useState('');

  useEffect(() => {
    let preview = `${firstName} ${lastName}`.trim();
    if (nickname.trim()) {
      preview = `${firstName} "${nickname.trim()}" ${lastName}`.trim();
    }
    setDisplayNamePreview(preview);
  }, [firstName, lastName, nickname]);

  return (
    <form action={completeUserProfile} className="space-y-6">
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

      <div>
        <label htmlFor="profile_photo" className="block text-sm font-medium text-gray-700">Foto de Perfil <span className="text-red-500">*</span></label>
        <input type="file" name="profile_photo" id="profile_photo" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
        <p className="text-xs text-gray-500 mt-1">La subida real a Cloudflare R2 se implementará después.</p>
      </div>

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