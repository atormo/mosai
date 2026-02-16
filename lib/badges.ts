import type { BadgePreset, BadgeType } from "./types";

export const badgePresets: readonly BadgePreset[] = [
  {
    type: "none",
    label: "Sin badge",
    emoji: "",
    color: "",
    description: "Sin indicador",
  },
  {
    type: "urgency",
    label: "Finaliza pronto",
    emoji: "🔥",
    color: "bg-red-500",
    description: "Para contenido que expira",
  },
  {
    type: "new",
    label: "Nuevo",
    emoji: "✨",
    color: "bg-emerald-500",
    description: "Para contenido reciente",
  },
  {
    type: "promo",
    label: "Sorteo",
    emoji: "🎁",
    color: "bg-purple-500",
    description: "Para sorteos y concursos",
  },
  {
    type: "limited",
    label: "Último día",
    emoji: "⏰",
    color: "bg-orange-500",
    description: "Para ofertas de tiempo limitado",
  },
  {
    type: "course",
    label: "Curso",
    emoji: "📚",
    color: "bg-blue-500",
    description: "Para contenido educativo",
  },
  {
    type: "custom",
    label: "Personalizado",
    emoji: "",
    color: "bg-gray-700",
    description: "Escribe tu propio texto y emoji",
  },
] as const;

export function getBadgePreset(type: BadgeType): BadgePreset | undefined {
  return badgePresets.find((b) => b.type === type);
}

export function getBadgeDisplay(
  type: BadgeType,
  customText?: string,
  customEmoji?: string
): { emoji: string; text: string } | null {
  if (type === "none") return null;

  const preset = getBadgePreset(type);
  if (!preset) return null;

  if (type === "custom") {
    return {
      emoji: customEmoji || "",
      text: customText || "",
    };
  }

  return {
    emoji: preset.emoji,
    text: preset.label,
  };
}
