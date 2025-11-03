-- Add audit logging table for status changes
CREATE TABLE IF NOT EXISTS status_change_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES missing_person_requests(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT, -- User ID or email if available, or 'system'
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB -- Additional context like IP address, user agent, etc.
);

-- Create indexes for audit table
CREATE INDEX IF NOT EXISTS idx_status_change_audit_request_id ON status_change_audit(request_id);
CREATE INDEX IF NOT EXISTS idx_status_change_audit_changed_at ON status_change_audit(changed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE status_change_audit ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to audit logs
CREATE POLICY "Allow anonymous read access to audit logs" ON status_change_audit
  FOR SELECT USING (true);

-- Allow authenticated users to insert audit logs
CREATE POLICY "Allow authenticated insert to audit logs" ON status_change_audit
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add email_sent_at field to track when notification was sent
ALTER TABLE missing_person_requests 
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;

-- Create function to trigger email notification on status change to 'found'
-- NOTE: This function uses pg_net extension which may not be available in all Supabase projects
-- For Supabase, you may want to use Database Webhooks instead:
-- https://supabase.com/docs/guides/database/webhooks
--
-- Alternative: Use the client-side notification service in src/lib/services/notification.ts
-- which is automatically called when status is updated through the dashboard

CREATE OR REPLACE FUNCTION trigger_found_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed to 'found' and email hasn't been sent
  IF NEW.status = 'found' AND (OLD.status IS NULL OR OLD.status != 'found') AND NEW.email_sent_at IS NULL THEN
    -- This requires pg_net extension to be enabled: CREATE EXTENSION IF NOT EXISTS pg_net;
    -- If pg_net is not available, comment out this function and rely on client-side notifications
    PERFORM net.http_post(
      url := current_setting('app.edge_function_url', true) || '/send-found-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.edge_function_key', true)
      ),
      body := jsonb_build_object(
        'request_id', NEW.id,
        'contact_name', NEW.contact_name,
        'contact_email', NEW.contact_email,
        'first_name', NEW.first_name,
        'last_name', NEW.last_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status changes (optional - only if using database-level notifications)
-- Comment this out if you prefer client-side notifications only
DROP TRIGGER IF EXISTS on_status_change_to_found ON missing_person_requests;
CREATE TRIGGER on_status_change_to_found
  AFTER UPDATE OF status ON missing_person_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_found_notification();
