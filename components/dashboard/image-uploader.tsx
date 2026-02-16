"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  type: "avatar" | "piece";
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  type,
  className,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { isUploading, uploadAvatar, uploadPieceImage, error } = useUpload();

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Show local preview immediately
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      // Upload to Supabase
      const result =
        type === "avatar"
          ? await uploadAvatar(file)
          : await uploadPieceImage(file);

      if (result.url) {
        onChange(result.url);
        setPreview(null);
      } else {
        setPreview(null);
      }

      // Clean up local URL
      URL.revokeObjectURL(localUrl);
    },
    [type, uploadAvatar, uploadPieceImage, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClear = () => {
    onChange("");
    setPreview(null);
  };

  const displayUrl = preview || value;

  return (
    <div className={className}>
      <Label className="mb-2 block">Imagen</Label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-lg overflow-hidden cursor-pointer transition-colors",
          type === "avatar" ? "w-24 h-24 rounded-full" : "aspect-square",
          displayUrl
            ? "border-transparent"
            : "border-gray-300 hover:border-[#FF6B35]"
        )}
      >
        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
            <span className="text-xs text-muted-foreground mt-2">Subiendo...</span>
          </div>
        ) : displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes={type === "avatar" ? "96px" : "(max-width: 768px) 100vw, 400px"}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Upload className="h-8 w-8 mb-2" />
            <span className="text-xs text-center px-2">
              Arrastra o haz clic
              <br />
              para subir
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      <p className="text-xs text-muted-foreground mt-2">
        {type === "avatar" ? "Máx. 2MB" : "Máx. 5MB"}. JPG, PNG, WebP
        {type === "piece" && " o GIF"}.
      </p>
    </div>
  );
}
