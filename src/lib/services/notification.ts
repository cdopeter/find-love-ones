/**
 * Notification service for handling status change notifications
 */

import { MissingPersonRequest } from '@/lib/types/database';

export interface StatusChangeNotification {
  request: MissingPersonRequest;
  oldStatus: string | null;
  newStatus: string;
}

/**
 * Handle status change notification - triggers email if status is "closed"
 */
export async function handleStatusChangeNotification({
  request,
  oldStatus,
  newStatus,
}: StatusChangeNotification): Promise<void> {
  try {
    // If status changed to "closed", trigger email notification
    if (
      newStatus === 'closed' &&
      oldStatus !== 'closed' &&
      request.requester_email
    ) {
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
async function sendFoundNotification(
  request: MissingPersonRequest
): Promise<void> {
  try {
    const apiUrl =
      typeof window !== 'undefined'
        ? '/api/send-found-notification'
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-found-notification`;

    // Note: EDGE_FUNCTION_SECRET should only be used server-side
    // Client-side calls will need to go through a server action or API route
    const secret = process.env.EDGE_FUNCTION_SECRET;
    if (!secret) {
      console.warn(
        'EDGE_FUNCTION_SECRET not configured - email notification may fail'
      );
    }

    // Fetch the most recent found update message if available
    let latestMessage = '';
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('found_updates')
        .select('message_from_found_party')
        .eq('request_id', request.id!)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        latestMessage = data.message_from_found_party;
      }
    } catch (err) {
      // If we can't fetch the message, continue without it
      console.warn('Could not fetch found update message:', err);
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        requestId: request.id,
        contactName: `${request.requester_first_name} ${request.requester_last_name}`,
        contactEmail: request.requester_email,
        firstName: request.target_first_name,
        lastName: request.target_last_name,
        lastSeenLocation: request.last_known_address,
        parish: request.parish,
        messageFromFound: latestMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to send notification: ${error.error || error.details || 'Unknown error'}`
      );
    }

    console.log(
      `Successfully sent found notification for ${request.target_first_name} ${request.target_last_name}`
    );
  } catch (error) {
    console.error('Error sending found notification:', error);
    // Log but don't throw - we want the status update to succeed even if email fails
  }
}

/**
 * Test hook for email notifications (for testing/development)
 * This can be used to test email sending without actually changing status
 */
export async function testFoundNotification(
  request: MissingPersonRequest
): Promise<{
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
