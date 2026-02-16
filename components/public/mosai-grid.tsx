import { cn } from "@/lib/utils";
import { themes } from "@/lib/themes";
import { MosaiPiece } from "./mosai-piece";
import type { Piece, ThemeKey } from "@/lib/types";

interface MosaiGridProps {
  pieces: Piece[];
  themeKey: ThemeKey;
}

export function MosaiGrid({ pieces, themeKey }: MosaiGridProps) {
  const theme = themes[themeKey];

  if (pieces.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className={cn("text-sm", theme.text)}>
          Este mosaico está vacío
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-3", theme.grid)}>
      {pieces.map((piece) => (
        <MosaiPiece key={piece.id} piece={piece} themeKey={themeKey} />
      ))}
    </div>
  );
}
