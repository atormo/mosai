"use client";

import Image from "next/image";
import { Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getBadgeDisplay, getBadgePreset } from "@/lib/badges";
import type { Piece } from "@/lib/types";

interface PieceCardProps {
  piece: Piece;
  onEdit: (piece: Piece) => void;
  onDelete: (piece: Piece) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function PieceCard({
  piece,
  onEdit,
  onDelete,
  onToggleActive,
}: PieceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: piece.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const badgeDisplay = getBadgeDisplay(
    piece.badge_type,
    piece.badge_text,
    piece.badge_emoji
  );
  const badgePreset = getBadgePreset(piece.badge_type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white rounded-lg border overflow-hidden",
        "transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1.5 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={piece.image_url}
          alt={piece.title || "Pieza"}
          fill
          className={cn(
            "object-cover",
            !piece.is_active && "opacity-50 grayscale"
          )}
          sizes="(max-width: 768px) 50vw, 33vw"
        />

        {/* Badge */}
        {badgeDisplay && (
          <div
            className={cn(
              "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium",
              badgePreset?.color || "bg-gray-700",
              "text-white"
            )}
          >
            {badgeDisplay.emoji} {badgeDisplay.text}
          </div>
        )}

        {/* Inactive overlay */}
        {!piece.is_active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <EyeOff className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      {/* Info & Actions */}
      <div className="p-3 space-y-3">
        {/* Title */}
        {piece.title && (
          <p className="text-sm font-medium truncate">{piece.title}</p>
        )}

        {/* URL */}
        <p className="text-xs text-muted-foreground truncate">
          {piece.destination_url}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(piece)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(piece)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {piece.is_active ? "Visible" : "Oculto"}
            </span>
            <Switch
              checked={piece.is_active}
              onCheckedChange={(checked) => onToggleActive(piece.id, checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
