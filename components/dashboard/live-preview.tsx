"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { themes } from "@/lib/themes";
import { getBadgeDisplay, getBadgePreset } from "@/lib/badges";
import type { Piece, Profile } from "@/lib/types";

interface LivePreviewProps {
  profile: Profile | null;
  pieces: Piece[];
  className?: string;
}

export function LivePreview({ profile, pieces, className }: LivePreviewProps) {
  const theme = themes[profile?.theme || "clean"];
  const activePieces = pieces.filter((p) => p.is_active);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <p className="text-sm text-muted-foreground mb-3">Vista previa</p>

      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-black rounded-[40px] p-3 shadow-xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />

        {/* Screen */}
        <div
          className={cn(
            "w-full h-full rounded-[32px] overflow-hidden overflow-y-auto",
            theme.container
          )}
        >
          {/* Header */}
          <div className="pt-10 pb-4 px-4 text-center">
            {/* Avatar */}
            {profile?.avatar_url ? (
              <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xl font-bold">
                {profile?.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}

            {/* Name */}
            <h2 className={cn("text-lg font-semibold", theme.header)}>
              {profile?.display_name || "Tu nombre"}
            </h2>

            {/* Bio */}
            {profile?.bio && (
              <p className={cn("text-xs mt-1", theme.text)}>{profile.bio}</p>
            )}
          </div>

          {/* Grid */}
          <div className={cn("grid grid-cols-3 px-1 pb-4", theme.grid)}>
            {activePieces.length > 0 ? (
              activePieces.map((piece) => {
                const badgeDisplay = getBadgeDisplay(
                  piece.badge_type,
                  piece.badge_text,
                  piece.badge_emoji
                );
                const badgePreset = getBadgePreset(piece.badge_type);

                return (
                  <div
                    key={piece.id}
                    className={cn(
                      "relative overflow-hidden",
                      theme.piece,
                      theme.aspectRatio
                    )}
                  >
                    <Image
                      src={piece.image_url}
                      alt={piece.title || "Pieza"}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />

                    {/* Badge */}
                    {badgeDisplay && (
                      <div
                        className={cn(
                          "absolute top-1 right-1 px-1 py-0.5 text-[8px] font-medium",
                          theme.badge,
                          badgePreset?.color
                        )}
                      >
                        {badgeDisplay.emoji}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-8 text-center">
                <p className={cn("text-xs", theme.text)}>
                  Añade piezas para ver tu mosaico
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pb-6 text-center">
            <p className={cn("text-[10px]", theme.text)}>
              Hecho con <span className="text-[#FF6B35]">MOSAI</span> 🟧
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
