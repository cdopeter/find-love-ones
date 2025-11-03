/**
 * Audit logging utilities for tracking status changes
 */

import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
  requestId: string;
  oldStatus: string | null;
  newStatus: string;
  changedBy?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a status change to the audit table
 */
export async function logStatusChange(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from('status_change_audit').insert({
      request_id: entry.requestId,
      old_status: entry.oldStatus,
      new_status: entry.newStatus,
      changed_by: entry.changedBy || 'system',
      metadata: entry.metadata || {},
    });

    if (error) {
      console.error('Failed to log status change to audit table:', error);
      throw error;
    }

    console.log(`Audit log created: ${entry.oldStatus} -> ${entry.newStatus} by ${entry.changedBy || 'system'}`);
  } catch (error) {
    console.error('Error in logStatusChange:', error);
    // Don't throw - we don't want audit logging failures to break the main flow
  }
}

/**
 * Get audit history for a specific request
 */
export async function getAuditHistory(requestId: string) {
  try {
    const { data, error } = await supabase
      .from('status_change_audit')
      .select('*')
      .eq('request_id', requestId)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch audit history:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAuditHistory:', error);
    return [];
  }
}

/**
 * Get recent audit logs across all requests
 */
export async function getRecentAuditLogs(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('status_change_audit')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch recent audit logs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecentAuditLogs:', error);
    return [];
  }
}
