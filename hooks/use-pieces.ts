"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Piece, CreatePieceInput, UpdatePieceInput } from "@/lib/types";

export function usePieces() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchPieces = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No user found");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("pieces")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setPieces(data || []);
      }
    } catch (err) {
      setError("Failed to fetch pieces");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const createPiece = useCallback(
    async (input: CreatePieceInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { error: "No user found" };

      // Get the next position
      const nextPosition = pieces.length;

      const { data, error: insertError } = await supabase
        .from("pieces")
        .insert({
          ...input,
          user_id: user.id,
          position: nextPosition,
        })
        .select()
        .single();

      if (insertError) {
        return { error: insertError.message };
      }

      setPieces((prev) => [...prev, data]);
      return { data };
    },
    [pieces.length, supabase]
  );

  const updatePiece = useCallback(
    async (id: string, updates: UpdatePieceInput) => {
      const { data, error: updateError } = await supabase
        .from("pieces")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        return { error: updateError.message };
      }

      setPieces((prev) => prev.map((p) => (p.id === id ? data : p)));
      return { data };
    },
    [supabase]
  );

  const deletePiece = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase
        .from("pieces")
        .delete()
        .eq("id", id);

      if (deleteError) {
        return { error: deleteError.message };
      }

      setPieces((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    },
    [supabase]
  );

  const reorderPieces = useCallback(
    async (reorderedPieces: Piece[]) => {
      // Optimistic update
      setPieces(reorderedPieces);

      // Update positions in database
      const updates = reorderedPieces.map((piece, index) => ({
        id: piece.id,
        position: index,
      }));

      // Batch update
      for (const update of updates) {
        const { error } = await supabase
          .from("pieces")
          .update({ position: update.position })
          .eq("id", update.id);

        if (error) {
          // Rollback on error
          fetchPieces();
          return { error: error.message };
        }
      }

      return { success: true };
    },
    [supabase, fetchPieces]
  );

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      return updatePiece(id, { is_active: isActive });
    },
    [updatePiece]
  );

  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  return {
    pieces,
    isLoading,
    error,
    refetch: fetchPieces,
    createPiece,
    updatePiece,
    deletePiece,
    reorderPieces,
    toggleActive,
  };
}
