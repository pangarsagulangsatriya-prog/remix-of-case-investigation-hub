-- ==========================================
-- INITIAL SUPABASE SCHEMA FOR CASE HUB
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Cases Table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending', 'archived')),
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Evidence Batches Table
CREATE TABLE IF NOT EXISTS evidence_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT, -- Images, Documents, Audio, Video
  file_count INTEGER DEFAULT 0,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Evidence Files Table
CREATE TABLE IF NOT EXISTS evidence_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES evidence_batches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  source TEXT,
  url TEXT,
  size TEXT,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'partial', 'reviewed')),
  tags TEXT[], -- Array of strings
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
-- Note: You might want to add specific policies depending on your auth setup
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;

-- 5. Create basic public policies (Allow all for development)
-- WARNING: In production, you should restrict these to authenticated users
CREATE POLICY "Public Access" ON cases FOR ALL USING (true);
CREATE POLICY "Public Access" ON evidence_batches FOR ALL USING (true);
CREATE POLICY "Public Access" ON evidence_files FOR ALL USING (true);

-- 6. Insert Mock Data (Optional)
INSERT INTO cases (case_number, title, status, severity)
VALUES ('CS-2026-0145', 'Conveyor Belt Failure - Section 14', 'open', 'High')
ON CONFLICT DO NOTHING;
