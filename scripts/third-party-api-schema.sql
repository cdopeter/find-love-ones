-- Third-Party API Database Schema Updates
-- This file contains all database changes needed for the third-party API feature

-- ============================================================================
-- 1. AUDIT_EVENTS TABLE
-- ============================================================================
-- Audit table for tracking all third-party API operations
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor TEXT NOT NULL, -- 'third_party', user ID, or system identifier
  action TEXT NOT NULL, -- 'create', 'update', 'read', 'delete'
  table_name TEXT NOT NULL, -- Table that was accessed
  record_id TEXT NOT NULL, -- ID of the record that was accessed
  payload JSONB, -- The data that was sent/received
  ip TEXT, -- Client IP address
  user_agent TEXT, -- User agent string
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_table ON audit_events(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_events_record_id ON audit_events(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor);

-- Enable Row Level Security
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can insert audit events
-- This ensures audit events can only be created by the API, not by clients
CREATE POLICY "Service role can insert audit events" ON audit_events
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR current_setting('role') = 'service_role');

-- RLS Policy: Authenticated users can read audit events
CREATE POLICY "Authenticated users can read audit events" ON audit_events
  FOR SELECT
  USING (auth.role() = 'authenticated' OR current_setting('role') = 'service_role');

-- ============================================================================
-- 2. REQUESTS TABLE CONSTRAINTS
-- ============================================================================
-- Add constraints to requests table for data integrity

-- Ensure status is one of the allowed values
ALTER TABLE requests 
  DROP CONSTRAINT IF EXISTS requests_status_check;

ALTER TABLE requests 
  ADD CONSTRAINT requests_status_check 
  CHECK (status IN ('open', 'closed'));

-- Ensure parish is one of the valid Jamaican parishes
ALTER TABLE requests
  DROP CONSTRAINT IF EXISTS requests_parish_check;

ALTER TABLE requests
  ADD CONSTRAINT requests_parish_check
  CHECK (parish IN (
    'Kingston', 'St. Andrew', 'St. Thomas', 'Portland',
    'St. Mary', 'St. Ann', 'Trelawny', 'St. James',
    'Manchester', 'Clarendon', 'St. Catherine',
    'Hanover', 'Westmoreland', 'St. Elizabeth'
  ));

-- Ensure required fields are not null
ALTER TABLE requests
  ALTER COLUMN target_first_name SET NOT NULL;

ALTER TABLE requests
  ALTER COLUMN target_last_name SET NOT NULL;

ALTER TABLE requests
  ALTER COLUMN last_known_address SET NOT NULL;

ALTER TABLE requests
  ALTER COLUMN parish SET NOT NULL;

ALTER TABLE requests
  ALTER COLUMN status SET NOT NULL;

-- Add default value for status
ALTER TABLE requests
  ALTER COLUMN status SET DEFAULT 'open';

-- ============================================================================
-- 3. FOUND_UPDATES TABLE
-- ============================================================================
-- Create found_updates table if it doesn't exist
CREATE TABLE IF NOT EXISTS found_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  message_from_found_party TEXT NOT NULL,
  created_by TEXT, -- Third-party identifier or user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_found_updates_request_id ON found_updates(request_id);
CREATE INDEX IF NOT EXISTS idx_found_updates_created_at ON found_updates(created_at DESC);

-- Add constraints
ALTER TABLE found_updates
  ALTER COLUMN message_from_found_party SET NOT NULL;

ALTER TABLE found_updates
  ADD CONSTRAINT found_updates_message_length_check
  CHECK (char_length(message_from_found_party) >= 1 AND char_length(message_from_found_party) <= 5000);

-- Enable Row Level Security
ALTER TABLE found_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read found_updates
CREATE POLICY "Anyone can read found_updates" ON found_updates
  FOR SELECT
  USING (true);

-- RLS Policy: Service role can insert found_updates (for third-party API)
CREATE POLICY "Service role can insert found_updates" ON found_updates
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR current_setting('role') = 'service_role');

-- RLS Policy: Service role can update found_updates (for third-party API)
CREATE POLICY "Service role can update found_updates" ON found_updates
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role' OR current_setting('role') = 'service_role');

-- ============================================================================
-- 4. HELPER FUNCTIONS (OPTIONAL)
-- ============================================================================
-- These functions can be used to enforce business rules at the database level

-- Function to validate request update
CREATE OR REPLACE FUNCTION validate_request_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent changing certain fields after creation
  IF OLD.id IS NOT NULL AND NEW.id != OLD.id THEN
    RAISE EXCEPTION 'Cannot change request ID';
  END IF;

  -- Ensure lat/lng are valid if provided
  IF NEW.lat IS NOT NULL AND (NEW.lat < -90 OR NEW.lat > 90) THEN
    RAISE EXCEPTION 'Invalid latitude: must be between -90 and 90';
  END IF;

  IF NEW.lng IS NOT NULL AND (NEW.lng < -180 OR NEW.lng > 180) THEN
    RAISE EXCEPTION 'Invalid longitude: must be between -180 and 180';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate request updates
DROP TRIGGER IF EXISTS validate_request_update_trigger ON requests;
CREATE TRIGGER validate_request_update_trigger
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION validate_request_update();

-- ============================================================================
-- 5. VERIFY RLS IS ENABLED
-- ============================================================================
-- Ensure RLS is enabled on all tables

-- Check and enable RLS on requests table
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================
-- Ensure service role has necessary permissions

-- Grant permissions on audit_events
GRANT INSERT ON audit_events TO service_role;
GRANT SELECT ON audit_events TO authenticated;

-- Grant permissions on found_updates
GRANT SELECT, INSERT, UPDATE ON found_updates TO service_role;

-- Grant permissions on requests
GRANT SELECT, UPDATE ON requests TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the setup

-- Verify audit_events table exists and has correct structure
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'audit_events'
-- ORDER BY ordinal_position;

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('audit_events', 'requests', 'found_updates');

-- Verify constraints
-- SELECT conname, contype, conrelid::regclass 
-- FROM pg_constraint 
-- WHERE conrelid IN ('requests'::regclass, 'found_updates'::regclass)
-- ORDER BY conrelid, conname;
