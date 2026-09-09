import React, { useState } from "react";

interface Props {
  petId: number;
  currentPhotoUrl?: string | null;
  onPhotoUploaded: (newUrl: string) => void;
}

export const PetPhotoUpload: React.FC<Props> = ({ petId, currentPhotoUrl, onPhotoUploaded }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:4000/api/mascotas/${petId}/upload-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir la imagen");

      const data = await response.json();
      onPhotoUploaded(data.fotoUrl);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar la foto de la mascota");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={currentPhotoUrl || "https://via.placeholder.com/150?text=Sin+Foto"}
        alt="Mascota"
        className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-sm"
      />
      <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md transition-colors">
        {uploading ? "Subiendo..." : "Cambiar Foto"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
};