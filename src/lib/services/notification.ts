/**
 * Notification service for handling status change notifications
 */

import { MissingPersonRequest } from '@/lib/types/database';
import { logStatusChange } from '@/lib/utils/audit';

export interface StatusChangeNotification {
  request: MissingPersonRequest;
  oldStatus: string | null;
  newStatus: string;
  changedBy?: string;
}

/**
 * Handle status change notification - logs audit and triggers email if status is "found"
 */
export async function handleStatusChangeNotification({
  request,
  oldStatus,
  newStatus,
  changedBy,
}: StatusChangeNotification): Promise<void> {
  try {
    // Log the status change to audit table
    if (request.id) {
      await logStatusChange({
        requestId: request.id,
        oldStatus,
        newStatus,
        changedBy,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        },
      });
    }

    // If status changed to "found", trigger email notification
    if (newStatus === 'found' && oldStatus !== 'found' && request.contact_email) {
      await sendFoundNotification(request);
    }
  } catch (error) {
    console.error('Error handling status change notification:', error);
    // Don't throw - we don't want notification failures to break the main flow
  }
}

/**
 * Send email notification when person is found
 */
async function sendFoundNotification(request: MissingPersonRequest): Promise<void> {
  try {
    const apiUrl =
      typeof window !== 'undefined'
        ? '/api/send-found-notification'
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-found-notification`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EDGE_FUNCTION_SECRET || process.env.NEXT_PUBLIC_EDGE_FUNCTION_SECRET}`,
      },
      body: JSON.stringify({
        requestId: request.id,
        contactName: request.contact_name,
        contactEmail: request.contact_email,
        firstName: request.first_name,
        lastName: request.last_name,
        lastSeenLocation: request.last_seen_location,
        parish: request.parish,
        messageFromFound: request.message_from_found,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to send notification: ${error.error || error.details || 'Unknown error'}`);
    }

    console.log(`Successfully sent found notification for ${request.first_name} ${request.last_name}`);
  } catch (error) {
    console.error('Error sending found notification:', error);
    // Log but don't throw - we want the status update to succeed even if email fails
  }
}

/**
 * Test hook for email notifications (for testing/development)
 * This can be used to test email sending without actually changing status
 */
export async function testFoundNotification(request: MissingPersonRequest): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await sendFoundNotification(request);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
