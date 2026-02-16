import { z } from "zod";

// Username validation
const usernameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

export const usernameSchema = z
  .string()
  .min(3, "El username debe tener al menos 3 caracteres")
  .max(30, "El username no puede tener más de 30 caracteres")
  .regex(
    usernameRegex,
    "Solo letras minúsculas, números y guiones. No puede empezar o terminar en guión."
  );

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  username: usernameSchema,
  display_name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Profile schemas
export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .optional(),
  bio: z.string().max(160, "La bio no puede tener más de 160 caracteres").optional(),
  avatar_url: z.string().url("URL inválida").optional().or(z.literal("")),
  theme: z.enum(["clean", "midnight", "candy", "brutalist", "film"]).optional(),
});

// Piece schemas
const urlSchema = z
  .string()
  .url("URL inválida")
  .refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    "La URL debe empezar con http:// o https://"
  );

export const badgeTypeSchema = z.enum([
  "none",
  "urgency",
  "new",
  "promo",
  "limited",
  "course",
  "custom",
]);

export const createPieceSchema = z.object({
  image_url: z.string().url("URL de imagen inválida"),
  destination_url: urlSchema,
  title: z.string().max(60, "El título no puede tener más de 60 caracteres").optional(),
  badge_type: badgeTypeSchema.optional().default("none"),
  badge_text: z
    .string()
    .max(24, "El badge no puede tener más de 24 caracteres")
    .optional(),
  badge_emoji: z.string().optional(),
});

export const updatePieceSchema = z.object({
  image_url: z.string().url("URL de imagen inválida").optional(),
  destination_url: urlSchema.optional(),
  title: z.string().max(60, "El título no puede tener más de 60 caracteres").optional(),
  badge_type: badgeTypeSchema.optional(),
  badge_text: z
    .string()
    .max(24, "El badge no puede tener más de 24 caracteres")
    .optional(),
  badge_emoji: z.string().optional(),
  position: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

// Types from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePieceInput = z.infer<typeof createPieceSchema>;
export type UpdatePieceInput = z.infer<typeof updatePieceSchema>;
