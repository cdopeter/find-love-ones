/**
 * Database types for the HopeNet application
 */

export interface MissingPersonRequest {
  id?: string;
  created_at?: string;
  updated_at?: string;

  // Person details
  first_name: string;
  last_name: string;
  age?: number;
  description?: string;
  last_seen_location: string;
  last_seen_date?: string;

  // Location information
  parish: string;

  // Contact information
  contact_name: string;
  contact_phone?: string;
  contact_email?: string;

  // Status
  status: 'missing' | 'found' | 'in_progress';

  // Additional info
  photo_url?: string;
  notes?: string;
  message_from_found?: string;
}

export type RequestStatus = 'missing' | 'found' | 'in_progress';
