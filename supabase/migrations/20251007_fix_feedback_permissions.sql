-- Fix Feedback Form Permissions
-- Purpose: Allow anonymous users to submit feedback without logging in
-- Run this in Supabase SQL Editor if you're getting 401 errors

-- Step 1: Remove any conflicting policies
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
DROP POLICY IF EXISTS "Allow anonymous feedback submission" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated feedback submission" ON feedback;

-- Step 2: Create a single, simple policy that allows anyone to submit feedback
CREATE POLICY "Enable insert for anonymous users"
ON feedback
FOR INSERT
WITH CHECK (true);

-- Step 3: Keep the read policy for admins only
DROP POLICY IF EXISTS "Authenticated users can read all feedback" ON feedback;
CREATE POLICY "Authenticated users can read feedback"
ON feedback
FOR SELECT
TO authenticated
USING (true);

-- Step 4: Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'feedback';

-- You should see the new policy listed above
-- Policy name: "Enable insert for anonymous users"
-- Command: INSERT
-- This allows anyone (including non-logged-in visitors) to submit feedback
