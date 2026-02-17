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
      className={cn("block group", theme.hover)}
    >
      {/* Image container */}
      <div
        className={cn(
          "relative overflow-hidden",
          theme.piece,
          theme.aspectRatio
        )}
      >
        <Image
          src={piece.image_url}
          alt={piece.title || ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 200px"
        />

        {/* Badge */}
        {badgeDisplay && (
          <div
            className={cn(
              "absolute top-2 left-2 px-2 py-1 text-xs font-medium",
              theme.badge,
              themeKey === "candy" && badgePreset?.color
            )}
          >
            {badgeDisplay.emoji} {badgeDisplay.text}
          </div>
        )}
      </div>

      {/* Title below image */}
      {piece.title && (
        <p
          className={cn(
            "mt-1.5 text-sm font-medium leading-tight line-clamp-2",
            theme.header
          )}
        >
          {piece.title}
        </p>
      )}
    </a>
  );
}
