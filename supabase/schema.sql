-- MOSAI Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '' CHECK (char_length(bio) <= 160),
  avatar_url TEXT DEFAULT '',
  theme TEXT DEFAULT 'clean',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles(username);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles visibles por todos"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Usuario edita su perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuario inserta su perfil"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- PIECES TABLE (piezas del mosaico)
-- ============================================
CREATE TABLE pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  title TEXT DEFAULT '' CHECK (char_length(title) <= 60),
  badge_text TEXT DEFAULT '' CHECK (char_length(badge_text) <= 24),
  badge_type TEXT DEFAULT 'none'
    CHECK (badge_type IN ('none','urgency','new','promo','limited','course','custom')),
  badge_emoji TEXT DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pieces_user_position ON pieces(user_id, position);

ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Piezas activas visibles por todos, owner ve todas"
  ON pieces FOR SELECT USING (
    is_active = true OR user_id = auth.uid()
  );

CREATE POLICY "Usuario inserta sus piezas"
  ON pieces FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario edita sus piezas"
  ON pieces FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuario elimina sus piezas"
  ON pieces FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these in Supabase Dashboard > Storage > Create bucket

-- Bucket: avatars
-- Public: Yes
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Bucket: piece-images
-- Public: Yes
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Piece images bucket policies
CREATE POLICY "Piece images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'piece-images');

CREATE POLICY "Users can upload their own piece images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'piece-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own piece images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'piece-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own piece images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'piece-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for pieces
CREATE TRIGGER update_pieces_updated_at
  BEFORE UPDATE ON pieces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
