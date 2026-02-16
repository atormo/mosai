"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type UploadBucket = "avatars" | "piece-images";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const uploadFile = useCallback(
    async (file: File, bucket: UploadBucket) => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("No user found");
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
          throw new Error("Tipo de archivo no válido. Usa JPG, PNG, WebP o GIF.");
        }

        // Validate file size
        const maxSize = bucket === "avatars" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          const maxMB = maxSize / (1024 * 1024);
          throw new Error(`El archivo es demasiado grande. Máximo ${maxMB}MB.`);
        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        setProgress(30);

        // Upload file
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        setProgress(80);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path);

        setProgress(100);

        return { url: publicUrl };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al subir archivo";
        setError(message);
        return { error: message };
      } finally {
        setIsUploading(false);
      }
    },
    [supabase]
  );

  const uploadAvatar = useCallback(
    (file: File) => uploadFile(file, "avatars"),
    [uploadFile]
  );

  const uploadPieceImage = useCallback(
    (file: File) => uploadFile(file, "piece-images"),
    [uploadFile]
  );

  const deleteFile = useCallback(
    async (url: string, bucket: UploadBucket) => {
      try {
        // Extract path from URL
        const urlObj = new URL(url);
        const path = urlObj.pathname.split(`/${bucket}/`)[1];

        if (!path) {
          throw new Error("Invalid file URL");
        }

        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([path]);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al eliminar archivo";
        return { error: message };
      }
    },
    [supabase]
  );

  return {
    isUploading,
    progress,
    error,
    uploadAvatar,
    uploadPieceImage,
    deleteFile,
  };
}
