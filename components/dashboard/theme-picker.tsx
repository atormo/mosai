"use client";

import { cn } from "@/lib/utils";
import { themes, themeKeys } from "@/lib/themes";
import { Label } from "@/components/ui/label";
import type { ThemeKey } from "@/lib/types";

interface ThemePickerProps {
  value: ThemeKey;
  onChange: (theme: ThemeKey) => void;
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="space-y-3">
      <Label>Tema visual</Label>
      <div className="grid grid-cols-5 gap-2">
        {themeKeys.map((key) => {
          const theme = themes[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                value === key
                  ? "border-[#FF6B35] bg-[#FF6B35]/5"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {/* Theme Preview */}
              <div
                className={cn(
                  "w-12 h-12 rounded-lg mb-2 flex items-center justify-center",
                  theme.container
                )}
              >
                <div className={cn("grid grid-cols-2 gap-0.5 w-8 h-8", theme.grid)}>
                  <div className={cn("bg-gray-400 rounded-sm", theme.piece)} />
                  <div className={cn("bg-gray-500 rounded-sm", theme.piece)} />
                  <div className={cn("bg-gray-300 rounded-sm", theme.piece)} />
                  <div className={cn("bg-gray-400 rounded-sm", theme.piece)} />
                </div>
              </div>
              <span className="text-xs font-medium">{theme.name}</span>
            </button>
          );
        })}
      </div>

      {/* Theme Description */}
      <p className="text-xs text-muted-foreground">
        {value === "clean" && "Profesional, limpio, atemporal"}
        {value === "midnight" && "Elegante, nocturno, premium"}
        {value === "candy" && "Divertido, colorido, juguetón"}
        {value === "brutalist" && "Raw, artístico, atrevido"}
        {value === "film" && "Fotográfico, editorial, cinematográfico"}
      </p>
    </div>
  );
}
