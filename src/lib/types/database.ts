/**
 * Database types for the HopeNet application
 */

export interface Profile {
  id: string;
  role: 'requester' | 'responder';
  created_at: string;
  updated_at: string;
}

export interface MissingPersonRequest {
  id?: string;
  created_at?: string;

  // Target person details
  target_first_name: string;
  target_last_name: string;
  last_known_address: string;

  // Location information
  parish: string;
  lat?: number | null;
  lng?: number | null;

  // Requester information
  requester_first_name: string;
  requester_last_name: string;
  requester_email: string;
  requester_phone?: string | null;

  // Status
  status: 'open' | 'closed';

  // Additional info
  message_to_person?: string | null;
  created_by?: string | null;

  // Email notification tracking
  email_sent_at?: string;
}

export type RequestStatus = 'open' | 'closed';

export interface FoundUpdate {
  id: string;
  request_id: string;
  message_from_found_party: string;
  created_by: string;
  created_at: string;
}

export interface StatusChangeAudit {
  id: string;
  request_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  changed_at: string;
  metadata?: Record<string, unknown>;
}

