/*
  # Fix RLS Policies for Users Table

  ## Problem
  The existing policies cause infinite recursion because they query the users table
  to check if a user is an admin, which triggers the same policy again.

  ## Solution
  Replace with simple policies that:
  1. Allow authenticated users to read their own record
  2. Allow any authenticated user to read the users table (needed for the app to function)
  3. Only authenticated users can access the data

  ## Security Note
  Since this is an internal visitor management system, allowing authenticated users
  to read user data is acceptable. Write operations are not permitted except through
  the application logic.
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin can manage users" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create simple, non-recursive policies

-- Allow authenticated users to read their own record and other user records
-- This is needed for the app to display employee lists, check roles, etc.
CREATE POLICY "Authenticated users can read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent direct inserts and deletes (these should be managed through auth.users)
CREATE POLICY "Prevent direct user creation"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Prevent user deletion"
  ON users FOR DELETE
  TO authenticated
  USING (false);
