/*
  # Create Visitor Management Tables

  ## Overview
  Creates the complete database schema for the visitor management system including
  visitors, visit logs, and CSO approvals.

  ## New Tables

  ### 1. visitors
  Stores visitor information
  - `id` (uuid, primary key)
  - `full_name` (text) - Visitor's full name
  - `phone` (text) - Contact number
  - `email` (text, optional) - Email address
  - `company` (text, optional) - Company/organization name
  - `id_type` (text) - Type of ID (Aadhar, PAN, Driving License, etc.)
  - `id_number` (text) - ID document number
  - `photo_url` (text, optional) - URL to visitor photo
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. visit_logs
  Tracks all visitor check-ins and check-outs
  - `id` (uuid, primary key)
  - `visitor_id` (uuid, foreign key) - References visitors table
  - `employee_id` (uuid, foreign key) - Employee being visited (from users table)
  - `purpose` (text) - Purpose of visit
  - `check_in_time` (timestamptz) - Entry time
  - `check_out_time` (timestamptz, optional) - Exit time
  - `status` (text) - pending_approval, approved, rejected, checked_in, checked_out
  - `cso_approved_by` (uuid, optional) - CSO who approved (from users table)
  - `cso_approved_at` (timestamptz, optional) - Approval timestamp
  - `rejection_reason` (text, optional) - Reason if rejected
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Authenticated users can read all records (needed for reception, CSO, admin)
  - Only authenticated users can create/update records
  - Soft deletes only (no direct deletion)

  ## Indexes
  - Index on visitor phone and email for quick lookup
  - Index on visit_logs status for filtering
  - Index on visit_logs dates for reporting
*/

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  company text,
  id_type text NOT NULL,
  id_number text NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create visit_logs table
CREATE TABLE IF NOT EXISTS visit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  purpose text NOT NULL,
  check_in_time timestamptz DEFAULT now(),
  check_out_time timestamptz,
  status text NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'checked_in', 'checked_out')),
  cso_approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  cso_approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitors_phone ON visitors(phone);
CREATE INDEX IF NOT EXISTS idx_visitors_email ON visitors(email);
CREATE INDEX IF NOT EXISTS idx_visit_logs_visitor_id ON visit_logs(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visit_logs_employee_id ON visit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_visit_logs_status ON visit_logs(status);
CREATE INDEX IF NOT EXISTS idx_visit_logs_check_in ON visit_logs(check_in_time);
CREATE INDEX IF NOT EXISTS idx_visit_logs_check_out ON visit_logs(check_out_time);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitors table
CREATE POLICY "Authenticated users can read visitors"
  ON visitors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create visitors"
  ON visitors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update visitors"
  ON visitors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for visit_logs table
CREATE POLICY "Authenticated users can read visit logs"
  ON visit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create visit logs"
  ON visit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update visit logs"
  ON visit_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_visit_logs_updated_at
  BEFORE UPDATE ON visit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
