import Image from "next/image";
import { cn } from "@/lib/utils";
import { themes } from "@/lib/themes";
import { getBadgeDisplay, getBadgePreset } from "@/lib/badges";
import type { Piece, ThemeKey } from "@/lib/types";

interface MosaiPieceProps {
  piece: Piece;
  themeKey: ThemeKey;
}

export function MosaiPiece({ piece, themeKey }: MosaiPieceProps) {
  const theme = themes[themeKey];
  const badgeDisplay = getBadgeDisplay(
    piece.badge_type,
    piece.badge_text,
    piece.badge_emoji
  );
  const badgePreset = getBadgePreset(piece.badge_type);

  return (
    <a
      href={piece.destination_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative block overflow-hidden",
        theme.piece,
        theme.aspectRatio,
        theme.hover
      )}
    >
      <Image
        src={piece.image_url}
        alt={piece.title || ""}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 200px"
      />

      {/* Badge */}
      {badgeDisplay && (
        <div
          className={cn(
            "absolute top-2 right-2 px-2 py-1 text-xs font-medium animate-in zoom-in-50 duration-300",
            theme.badge,
            themeKey === "candy" && badgePreset?.color
          )}
        >
          {badgeDisplay.emoji} {badgeDisplay.text}
        </div>
      )}

      {/* Title overlay (optional) */}
      {piece.title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-white text-xs font-medium truncate">
            {piece.title}
          </p>
        </div>
      )}
    </a>
  );
}
