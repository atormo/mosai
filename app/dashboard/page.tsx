"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PieceGrid } from "@/components/dashboard/piece-grid";
import { PieceForm } from "@/components/dashboard/piece-form";
import { LivePreview } from "@/components/dashboard/live-preview";
import { usePieces } from "@/hooks/use-pieces";
import { useProfile } from "@/hooks/use-profile";
import type { Piece, CreatePieceInput, UpdatePieceInput } from "@/lib/types";

export default function DashboardPage() {
  const {
    pieces,
    isLoading,
    createPiece,
    updatePiece,
    deletePiece,
    reorderPieces,
    toggleActive,
  } = usePieces();
  const { profile } = useProfile();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pieceToDelete, setPieceToDelete] = useState<Piece | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddNew = () => {
    setEditingPiece(null);
    setFormOpen(true);
  };

  const handleEdit = (piece: Piece) => {
    setEditingPiece(piece);
    setFormOpen(true);
  };

  const handleDelete = (piece: Piece) => {
    setPieceToDelete(piece);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pieceToDelete) return;

    setIsDeleting(true);
    const result = await deletePiece(pieceToDelete.id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Pieza eliminada");
    }

    setIsDeleting(false);
    setDeleteConfirmOpen(false);
    setPieceToDelete(null);
  };

  const handleSubmit = async (data: CreatePieceInput | UpdatePieceInput) => {
    if (editingPiece) {
      return updatePiece(editingPiece.id, data);
    } else {
      return createPiece(data as CreatePieceInput);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const result = await toggleActive(id, isActive);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isActive ? "Pieza visible" : "Pieza oculta");
    }
  };

  const handleReorder = async (reorderedPieces: Piece[]) => {
    const result = await reorderPieces(reorderedPieces);
    if (result.error) {
      toast.error("Error al reordenar");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tus piezas</h1>
            <p className="text-muted-foreground">
              {pieces.length} {pieces.length === 1 ? "pieza" : "piezas"} en tu
              mosaico
            </p>
          </div>
          {pieces.length > 0 && (
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva pieza
            </Button>
          )}
        </div>

        {/* Grid */}
        <PieceGrid
          pieces={pieces}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onAddNew={handleAddNew}
        />
      </div>

      {/* Live Preview - Hidden on mobile */}
      <div className="hidden xl:block sticky top-6 h-fit">
        <LivePreview profile={profile} pieces={pieces} />
      </div>

      {/* Piece Form Modal */}
      <PieceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        piece={editingPiece}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta pieza?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La pieza será eliminada
              permanentemente de tu mosaico.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
