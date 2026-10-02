-- ====================================================================
-- MY MUSIC HUB - Supabase Database Schema
-- Run this script in the Supabase SQL Editor: Dashboard -> SQL Editor
-- ====================================================================

-- 1. Create tracks table
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Unknown',
    source_url TEXT UNIQUE NOT NULL,
    thumbnail_url TEXT,
    genre TEXT DEFAULT 'Lo-Fi',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create indexes for high performance search & sorting
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON public.tracks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON public.tracks (genre);
CREATE INDEX IF NOT EXISTS idx_tracks_title ON public.tracks (title);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow anyone (public/guest) to read tracks
CREATE POLICY "Public tracks are viewable by everyone" 
ON public.tracks 
FOR SELECT 
USING (true);

-- Allow service role (used by Next.js Serverless API routes) full access
CREATE POLICY "Service role has full access" 
ON public.tracks 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Seed initial data (User selected YouTube tracks)
INSERT INTO public.tracks (title, artist, source_url, thumbnail_url, genre)
VALUES
    ('drizzle', 'massobeats', 'https://www.youtube.com/watch?v=HVOs8FyKwes', 'https://img.youtube.com/vi/HVOs8FyKwes/hqdefault.jpg', 'Lo-Fi'),
    ('Dreamy', 'Elijah Lee', 'https://www.youtube.com/watch?v=Uq8XP-SRlKQ', 'https://img.youtube.com/vi/Uq8XP-SRlKQ/hqdefault.jpg', 'Chill'),
    ('Nightfall Vibes', 'Lofi Records', 'https://www.youtube.com/watch?v=-2YAToTspYQ', 'https://img.youtube.com/vi/-2YAToTspYQ/hqdefault.jpg', 'Lo-Fi'),
    ('Midnight Reverie', 'Chill Beats', 'https://www.youtube.com/watch?v=2AyYv07Jxlw', 'https://img.youtube.com/vi/2AyYv07Jxlw/hqdefault.jpg', 'Piano'),
    ('until then', 'massobeats', 'https://www.youtube.com/watch?v=7FrSki6hvzs', 'https://img.youtube.com/vi/7FrSki6hvzs/hqdefault.jpg', 'Lo-Fi')
ON CONFLICT (source_url) DO NOTHING;
