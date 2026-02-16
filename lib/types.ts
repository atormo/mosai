// Database types
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  theme: ThemeKey;
  created_at: string;
  updated_at: string;
}

export interface Piece {
  id: string;
  user_id: string;
  image_url: string;
  destination_url: string;
  title: string;
  badge_text: string;
  badge_type: BadgeType;
  badge_emoji: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Badge types
export type BadgeType =
  | "none"
  | "urgency"
  | "new"
  | "promo"
  | "limited"
  | "course"
  | "custom";

export interface BadgePreset {
  type: BadgeType;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

// Theme types
export type ThemeKey = "clean" | "midnight" | "candy" | "brutalist" | "film";

export interface Theme {
  name: string;
  preview: string;
  container: string;
  grid: string;
  piece: string;
  badge: string;
  header: string;
  text: string;
  hover: string;
  aspectRatio: string;
}

// Form types
export interface CreatePieceInput {
  image_url: string;
  destination_url: string;
  title?: string;
  badge_text?: string;
  badge_type?: BadgeType;
  badge_emoji?: string;
}

export interface UpdatePieceInput extends Partial<CreatePieceInput> {
  position?: number;
  is_active?: boolean;
}

export interface UpdateProfileInput {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  theme?: ThemeKey;
}
