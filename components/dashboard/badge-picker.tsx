"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { badgePresets } from "@/lib/badges";
import type { BadgeType } from "@/lib/types";

interface BadgePickerProps {
  value: BadgeType;
  customText: string;
  customEmoji: string;
  onChange: (type: BadgeType, text: string, emoji: string) => void;
}

export function BadgePicker({
  value,
  customText,
  customEmoji,
  onChange,
}: BadgePickerProps) {
  return (
    <div className="space-y-4">
      <Label>Badge (opcional)</Label>

      {/* Badge Presets */}
      <div className="flex flex-wrap gap-2">
        {badgePresets.map((preset) => (
          <button
            key={preset.type}
            type="button"
            onClick={() => onChange(preset.type, customText, customEmoji)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              "border-2",
              value === preset.type
                ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            {preset.type === "none" ? (
              "Sin badge"
            ) : (
              <>
                {preset.emoji} {preset.label}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Custom Badge Fields */}
      {value === "custom" && (
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1">
            <Label htmlFor="customEmoji" className="text-xs">
              Emoji
            </Label>
            <Input
              id="customEmoji"
              value={customEmoji}
              onChange={(e) => onChange(value, customText, e.target.value)}
              placeholder="🎯"
              maxLength={2}
              className="text-center"
            />
          </div>
          <div className="col-span-3">
            <Label htmlFor="customText" className="text-xs">
              Texto
            </Label>
            <Input
              id="customText"
              value={customText}
              onChange={(e) => onChange(value, e.target.value, customEmoji)}
              placeholder="Mi badge personalizado"
              maxLength={24}
            />
          </div>
        </div>
      )}

      {/* Preview */}
      {value !== "none" && (
        <div className="text-xs text-muted-foreground">
          Vista previa:{" "}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white",
              badgePresets.find((p) => p.type === value)?.color || "bg-gray-700"
            )}
          >
            {value === "custom"
              ? `${customEmoji} ${customText}`
              : `${badgePresets.find((p) => p.type === value)?.emoji} ${
                  badgePresets.find((p) => p.type === value)?.label
                }`}
          </span>
        </div>
      )}
    </div>
  );
}
