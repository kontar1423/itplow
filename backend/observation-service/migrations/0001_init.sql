CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS observation_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_type VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  object_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS observation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES observation_comments(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
