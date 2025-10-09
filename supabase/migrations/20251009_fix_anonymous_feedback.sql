-- Fix Anonymous Feedback Submission Issue
-- Date: 2025-10-09
-- Problem: Feedback form failing with "Submission failed" on live site
-- Cause: RLS policy not allowing anonymous (non-logged-in) users to submit feedback

-- Step 1: Check current policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'feedback';

-- Step 2: Drop ALL existing INSERT policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON feedback;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
DROP POLICY IF EXISTS "Allow anonymous feedback submission" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated feedback submission" ON feedback;

-- Step 3: Create the correct policy that explicitly allows BOTH anonymous AND authenticated users
CREATE POLICY "Allow anyone to submit feedback"
ON feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Step 4: Verify RLS is enabled
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify the new policy
SELECT
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'feedback' AND cmd = 'INSERT';

-- You should see:
-- Policy: "Allow anyone to submit feedback"
-- Roles: {anon, authenticated}
-- Command: INSERT
-- With Check: true
