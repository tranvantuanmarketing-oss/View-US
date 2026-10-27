-- ====================================================================
-- Reels Studio V2 - Complete Supabase Database Schema
-- Security: RLS enabled on all tables, no anon access on private tables.
-- Server interacts via service_role key.
-- ====================================================================

-- 1. Enable pgcrypto for UUIDs & cryptographic functions if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for idempotency in migrations
DROP VIEW IF EXISTS render_stats CASCADE;
DROP TABLE IF EXISTS batch_items CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS viral_posts CASCADE;
DROP TABLE IF EXISTS page_music CASCADE;
DROP TABLE IF EXISTS music_tracks CASCADE;
DROP TABLE IF EXISTS page_avatars CASCADE;
DROP TABLE IF EXISTS avatars CASCADE;
DROP TABLE IF EXISTS page_templates CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS helpers CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS staff CASCADE;

-- 2. Staff Table
CREATE TABLE staff (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  web_domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Pages Table
CREATE TABLE pages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  locale TEXT NOT NULL, -- 'fr', 'nl', 'de', 'en', 'es', 'pl', 'it', 'vi', 'da', 'no', 'sv', 'fi'
  owner_staff_id TEXT REFERENCES staff(id) ON DELETE SET NULL,
  settings_json JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Templates Table
CREATE TABLE templates (
  id TEXT PRIMARY KEY, -- slug e.g. 'the-vet-cam-dao'
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  "group" TEXT NOT NULL, -- e.g. 'the-vet' ("Thẻ màu + vệt tên")
  layers_json JSONB DEFAULT '{}'::jsonb NOT NULL,
  palettes_json JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Page Templates Junction Table
CREATE TABLE page_templates (
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  palette_ids TEXT[] DEFAULT '{}'::text[] NOT NULL,
  PRIMARY KEY (page_id, template_id)
);

-- 6. Avatars Table
CREATE TABLE avatars (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  image_path TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('nu', 'nam')),
  age_min INTEGER NOT NULL DEFAULT 20,
  age_max INTEGER NOT NULL DEFAULT 65,
  used_by_page_ids TEXT[] DEFAULT '{}'::text[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Page Avatars Junction Table
CREATE TABLE page_avatars (
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  avatar_id TEXT NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
  PRIMARY KEY (page_id, avatar_id)
);

-- 8. Music Tracks Table
CREATE TABLE music_tracks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  file_path TEXT NOT NULL,
  title TEXT NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('tuoi-sang', 'nhe-nhang', 'tram')),
  duration_sec INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Page Music Junction Table
CREATE TABLE page_music (
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL REFERENCES music_tracks(id) ON DELETE CASCADE,
  PRIMARY KEY (page_id, track_id)
);

-- 10. Viral Posts Table
CREATE TABLE viral_posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'csv', 'graph_api'
  page_name TEXT NOT NULL,
  page_followers INTEGER DEFAULT 0,
  locale TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('anh', 'bai-viet', 'video')),
  caption TEXT NOT NULL,
  image_url TEXT,
  comments INTEGER DEFAULT 0,
  reactions INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ,
  fb_url TEXT,
  has_web_link BOOLEAN DEFAULT false,
  imported_by TEXT REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Cards Table ("Kho thẻ")
CREATE TABLE cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  locale TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('pending_write', 'ready', 'used', 'error')),
  source_viral_id TEXT REFERENCES viral_posts(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('nu', 'nam')),
  age_hint INTEGER,
  time_label TEXT NOT NULL DEFAULT 'Vừa xong',
  title TEXT NOT NULL,
  body TEXT NOT NULL, -- 5 lines of story card text
  highlights TEXT[] DEFAULT '{}'::text[] NOT NULL,
  cta TEXT NOT NULL,
  caption TEXT NOT NULL,
  first_comment TEXT NOT NULL,
  avatar_hint JSONB DEFAULT '{}'::jsonb NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Helpers ("Máy dựng") Table
CREATE TABLE helpers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  staff_id TEXT REFERENCES staff(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  os TEXT NOT NULL DEFAULT 'macos',
  version TEXT NOT NULL DEFAULT '1.0.0',
  concurrency INTEGER NOT NULL DEFAULT 4,
  last_seen_at TIMESTAMPTZ,
  cache_mb INTEGER DEFAULT 0,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Batches ("Lô video") Table
CREATE TABLE batches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE RESTRICT,
  staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  count INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'system' CHECK (mode IN ('system', 'json')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'rendering', 'done', 'failed', 'cancelled', 'requested')),
  done_count INTEGER NOT NULL DEFAULT 0,
  settings_snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  helper_id TEXT REFERENCES helpers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  finished_at TIMESTAMPTZ
);

-- 14. Batch Items Table
CREATE TABLE batch_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE RESTRICT,
  template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE RESTRICT,
  palette_id TEXT NOT NULL,
  avatar_id TEXT REFERENCES avatars(id) ON DELETE SET NULL,
  track_id TEXT REFERENCES music_tracks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'rendering', 'done', 'failed')),
  output_path TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  finished_at TIMESTAMPTZ
);

-- 15. Render Stats View (videos done per staff x locale x page x day)
CREATE OR REPLACE VIEW render_stats AS
SELECT 
  b.staff_id,
  s.name AS staff_name,
  p.locale,
  p.id AS page_id,
  p.name AS page_name,
  DATE(bi.finished_at) AS render_date,
  COUNT(bi.id) AS videos_done
FROM batch_items bi
JOIN batches b ON bi.batch_id = b.id
JOIN pages p ON b.page_id = p.id
JOIN staff s ON b.staff_id = s.id
WHERE bi.status = 'done'
GROUP BY b.staff_id, s.name, p.locale, p.id, p.name, DATE(bi.finished_at);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: NO anon access policies exist.
-- Server uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS safely.
-- ====================================================================

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_items ENABLE ROW LEVEL SECURITY;

-- Note: No PUBLIC or anon SELECT/INSERT/UPDATE/DELETE policies are created.
-- All operations run strictly authenticated through the Next.js server runtime
-- using the Supabase service-role client after HMAC session validation.
