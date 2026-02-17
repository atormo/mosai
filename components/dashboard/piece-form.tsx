"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "./image-uploader";
import { BadgePicker } from "./badge-picker";
import { createPieceSchema, updatePieceSchema } from "@/lib/validations";
import type { Piece, BadgeType, CreatePieceInput, UpdatePieceInput } from "@/lib/types";

interface PieceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  piece?: Piece | null;
  onSubmit: (data: CreatePieceInput | UpdatePieceInput) => Promise<{ error?: string }>;
}

export function PieceForm({ open, onOpenChange, piece, onSubmit }: PieceFormProps) {
  const isEditing = !!piece;

  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [title, setTitle] = useState("");
  const [badgeType, setBadgeType] = useState<BadgeType>("none");
  const [badgeText, setBadgeText] = useState("");
  const [badgeEmoji, setBadgeEmoji] = useState("");

  // Reset form when opening/closing or piece changes
  useEffect(() => {
    if (open && piece) {
      setImageUrl(piece.image_url);
      setDestinationUrl(piece.destination_url);
      setTitle(piece.title);
      setBadgeType(piece.badge_type);
      setBadgeText(piece.badge_text);
      setBadgeEmoji(piece.badge_emoji);
    } else if (!open) {
      setImageUrl("");
      setDestinationUrl("");
      setTitle("");
      setBadgeType("none");
      setBadgeText("");
      setBadgeEmoji("");
    }
  }, [open, piece]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      image_url: imageUrl,
      destination_url: destinationUrl,
      title: title || undefined,
      badge_type: badgeType,
      badge_text: badgeType === "custom" ? badgeText : undefined,
      badge_emoji: badgeType === "custom" ? badgeEmoji : undefined,
    };

    // Validate
    const schema = isEditing ? updatePieceSchema : createPieceSchema;
    const result = schema.safeParse(data);

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    const response = await onSubmit(data);

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(isEditing ? "Pieza actualizada" : "Pieza creada");
      onOpenChange(false);
    }

    setIsLoading(false);
  };

  const handleBadgeChange = (type: BadgeType, text: string, emoji: string) => {
    setBadgeType(type);
    setBadgeText(text);
    setBadgeEmoji(emoji);
  };

  const isValid = imageUrl && destinationUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar pieza" : "Nueva pieza"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Left: Image Upload */}
            <div className="sm:w-[200px] shrink-0">
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                type="piece"
                compact
              />
            </div>

            {/* Right: Fields */}
            <div className="flex-1 space-y-4">
              {/* Destination URL */}
              <div className="space-y-1">
                <Label htmlFor="destinationUrl">URL de destino</Label>
                <Input
                  id="destinationUrl"
                  type="url"
                  placeholder="https://ejemplo.com/mi-contenido"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A donde llevara esta pieza cuando hagan clic.
                </p>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <Label htmlFor="title">Titulo (opcional)</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Mi nuevo podcast"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/60 caracteres
                </p>
              </div>

              {/* Badge Picker */}
              <BadgePicker
                value={badgeType}
                customText={badgeText}
                customEmoji={badgeEmoji}
                onChange={handleBadgeChange}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Guardando..." : "Creando..."}
                </>
              ) : isEditing ? (
                "Guardar cambios"
              ) : (
                "Crear pieza"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
