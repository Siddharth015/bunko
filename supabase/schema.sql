-- Bunko Multi-Media Tracking App - Database Schema
-- This file contains the complete database schema for Supabase

-- ============================================================
-- EXTENSIONS
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CUSTOM TYPES
-- ============================================================

-- Media type enum for tracking different types of media
CREATE TYPE media_type AS ENUM ('MOVIE', 'BOOK', 'ANIME');

-- Status enum for tracking user progress
CREATE TYPE media_status AS ENUM (
  'PLAN_TO_WATCH',
  'WATCHING',
  'COMPLETED',
  'ON_HOLD',
  'DROPPED'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles table
-- Stores user profile information including their top four media selections
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  top_four_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- Media entries table
-- Stores individual media tracking entries for each user
CREATE TABLE media_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL, -- External media ID (from TMDB, MAL, etc.)
  media_type media_type NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  review TEXT,
  status media_status NOT NULL DEFAULT 'PLAN_TO_WATCH',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT review_length CHECK (char_length(review) <= 2000),
  -- Ensure one entry per user per media item
  UNIQUE(user_id, media_id, media_type)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Index on username for fast lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- Indexes on media_entries for common queries
CREATE INDEX idx_media_entries_user_id ON media_entries(user_id);
CREATE INDEX idx_media_entries_media_type ON media_entries(media_type);
CREATE INDEX idx_media_entries_status ON media_entries(status);
CREATE INDEX idx_media_entries_created_at ON media_entries(created_at DESC);

-- Composite index for user's entries filtered by type and status
CREATE INDEX idx_media_entries_user_type_status ON media_entries(user_id, media_type, status);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to media_entries table
CREATE TRIGGER update_media_entries_updated_at
  BEFORE UPDATE ON media_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Media entries policies
-- Users can view all media entries (for social features)
CREATE POLICY "Media entries are viewable by everyone"
  ON media_entries FOR SELECT
  USING (true);

-- Users can insert their own media entries
CREATE POLICY "Users can insert their own media entries"
  ON media_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own media entries
CREATE POLICY "Users can update their own media entries"
  ON media_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own media entries
CREATE POLICY "Users can delete their own media entries"
  ON media_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS (Optional)
-- ============================================================

-- Function to get user's media entries by type
CREATE OR REPLACE FUNCTION get_user_media_by_type(
  p_user_id UUID,
  p_media_type media_type
)
RETURNS SETOF media_entries AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM media_entries
  WHERE user_id = p_user_id AND media_type = p_media_type
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_entries', COUNT(*),
    'movies', COUNT(*) FILTER (WHERE media_type = 'MOVIE'),
    'books', COUNT(*) FILTER (WHERE media_type = 'BOOK'),
    'anime', COUNT(*) FILTER (WHERE media_type = 'ANIME'),
    'completed', COUNT(*) FILTER (WHERE status = 'COMPLETED'),
    'watching', COUNT(*) FILTER (WHERE status = 'WATCHING'),
    'plan_to_watch', COUNT(*) FILTER (WHERE status = 'PLAN_TO_WATCH')
  )
  INTO result
  FROM media_entries
  WHERE user_id = p_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
