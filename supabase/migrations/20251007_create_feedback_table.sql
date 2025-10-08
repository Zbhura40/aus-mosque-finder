-- User Feedback System - Database Schema
-- Created: 2025-10-07
-- Purpose: Store user feedback and suggestions from the website

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: feedback
-- Purpose: Store user feedback, suggestions, and mosque submissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS feedback (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Feedback content
  feedback_text TEXT NOT NULL,
  page_url TEXT,  -- Which page user was on when submitting
  user_agent TEXT,  -- Browser info for debugging

  -- Optional contact info (if user wants follow-up)
  user_email TEXT,
  user_name TEXT,

  -- Tracking and management
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  is_read BOOLEAN DEFAULT false,
  admin_notes TEXT,  -- Internal notes for team

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Index for status filtering (most common query)
CREATE INDEX idx_feedback_status
ON feedback(status, created_at DESC);

-- Index for unread feedback
CREATE INDEX idx_feedback_unread
ON feedback(is_read, created_at DESC)
WHERE is_read = false;

-- Index for recent feedback
CREATE INDEX idx_feedback_created_at
ON feedback(created_at DESC);

-- Index for email lookups (if user contacts again)
CREATE INDEX idx_feedback_user_email
ON feedback(user_email)
WHERE user_email IS NOT NULL;

-- ============================================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON feedback
FOR EACH ROW
EXECUTE FUNCTION update_feedback_updated_at();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Purpose: Secure access to feedback data
-- ============================================================================

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT feedback (submit from website)
CREATE POLICY "Anyone can submit feedback"
ON feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users (admins) can read feedback
CREATE POLICY "Authenticated users can read all feedback"
ON feedback
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can update feedback (mark as read, change status)
CREATE POLICY "Authenticated users can update feedback"
ON feedback
FOR UPDATE
TO authenticated
USING (true);

-- Only service role can delete feedback (rarely needed)
CREATE POLICY "Service role can delete feedback"
ON feedback
FOR DELETE
TO service_role
USING (true);

-- ============================================================================
-- Helpful Views
-- ============================================================================

-- View: Unread feedback (priority inbox)
CREATE OR REPLACE VIEW feedback_unread AS
SELECT
  id,
  feedback_text,
  user_email,
  user_name,
  page_url,
  created_at,
  status
FROM feedback
WHERE is_read = false
ORDER BY created_at DESC;

-- View: Recent feedback (last 30 days)
CREATE OR REPLACE VIEW feedback_recent AS
SELECT
  id,
  feedback_text,
  user_email,
  user_name,
  page_url,
  status,
  is_read,
  created_at
FROM feedback
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- View: Feedback statistics
CREATE OR REPLACE VIEW feedback_stats AS
SELECT
  COUNT(*) AS total_feedback,
  COUNT(*) FILTER (WHERE is_read = false) AS unread_count,
  COUNT(*) FILTER (WHERE status = 'new') AS new_count,
  COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
  COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS this_week,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS this_month
FROM feedback;

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- Function: Mark feedback as read
CREATE OR REPLACE FUNCTION mark_feedback_read(feedback_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE feedback
  SET is_read = true
  WHERE id = feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update feedback status
CREATE OR REPLACE FUNCTION update_feedback_status(
  feedback_id UUID,
  new_status TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE feedback
  SET
    status = new_status,
    resolved_at = CASE WHEN new_status = 'resolved' THEN NOW() ELSE resolved_at END
  WHERE id = feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE feedback IS 'Stores user feedback, suggestions, and mosque submission requests';
COMMENT ON COLUMN feedback.status IS 'Workflow status: new, in_progress, resolved, or archived';
COMMENT ON COLUMN feedback.is_read IS 'Whether admin has reviewed this feedback';
COMMENT ON COLUMN feedback.admin_notes IS 'Internal notes for team - not visible to users';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify table created
DO $$
BEGIN
  RAISE NOTICE 'Migration complete! Table created:';
  RAISE NOTICE '  - feedback';
  RAISE NOTICE 'Views created:';
  RAISE NOTICE '  - feedback_unread';
  RAISE NOTICE '  - feedback_recent';
  RAISE NOTICE '  - feedback_stats';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - mark_feedback_read()';
  RAISE NOTICE '  - update_feedback_status()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run this migration in Supabase Dashboard';
  RAISE NOTICE '  2. Update UserFeedback.tsx to save to this table';
  RAISE NOTICE '  3. View feedback in Supabase > Table Editor > feedback';
END $$;
