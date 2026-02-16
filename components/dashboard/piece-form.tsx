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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar pieza" : "Nueva pieza"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <ImageUploader
            value={imageUrl}
            onChange={setImageUrl}
            type="piece"
          />

          {/* Destination URL */}
          <div className="space-y-2">
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
              A dónde llevará esta pieza cuando alguien haga clic.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
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

          <DialogFooter>
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
