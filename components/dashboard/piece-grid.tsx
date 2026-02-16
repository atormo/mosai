"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { PieceCard } from "./piece-card";
import { Button } from "@/components/ui/button";
import type { Piece } from "@/lib/types";

interface PieceGridProps {
  pieces: Piece[];
  onReorder: (pieces: Piece[]) => void;
  onEdit: (piece: Piece) => void;
  onDelete: (piece: Piece) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onAddNew: () => void;
}

export function PieceGrid({
  pieces,
  onReorder,
  onEdit,
  onDelete,
  onToggleActive,
  onAddNew,
}: PieceGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pieces.findIndex((p) => p.id === active.id);
      const newIndex = pieces.findIndex((p) => p.id === over.id);
      const newOrder = arrayMove(pieces, oldIndex, newIndex);
      onReorder(newOrder);
    }
  }

  if (pieces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-4xl">🟧</span>
        </div>
        <h3 className="text-lg font-medium mb-2">Tu mosaico está vacío</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Añade tu primera pieza para empezar a construir tu MOSAI. Cada pieza es
          una imagen clicable que lleva a un destino.
        </p>
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Añadir primera pieza
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pieces} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pieces.map((piece) => (
            <PieceCard
              key={piece.id}
              piece={piece}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}

          {/* Add New Card */}
          <button
            onClick={onAddNew}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">Nueva pieza</span>
          </button>
        </div>
      </SortableContext>

      <p className="text-center text-sm text-muted-foreground mt-6">
        ☝️ Arrastra las piezas para reordenar tu mosaico
      </p>
    </DndContext>
  );
}
