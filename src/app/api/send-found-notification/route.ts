import { NextRequest, NextResponse } from 'next/server';
import {
  generateFoundNotificationHTML,
  generateFoundNotificationText,
  getFoundNotificationSubject,
} from '@/lib/email/templates';

export const runtime = 'edge';

interface SendNotificationRequest {
  requestId: string;
  contactName: string;
  contactEmail: string;
  firstName: string;
  lastName: string;
  lastSeenLocation: string;
  parish: string;
  messageFromFound?: string;
}

/**
 * Edge Function to send email notification when person is found
 * This can be called from the client or from a Supabase webhook/trigger
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.EDGE_FUNCTION_SECRET;

    if (!expectedAuth || authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SendNotificationRequest = await request.json();
    const { contactEmail, contactName, firstName, lastName, lastSeenLocation, parish, messageFromFound } =
      body;

    // Validate required fields
    if (!contactEmail || !contactName || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare email data
    const emailData = {
      contactName,
      firstName,
      lastName,
      lastSeenLocation,
      parish,
      messageFromFound,
      dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://hopenet.example.com/dashboard',
    };

    const htmlContent = generateFoundNotificationHTML(emailData);
    const textContent = generateFoundNotificationText(emailData);
    const subject = getFoundNotificationSubject(firstName, lastName);

    // Send email using your preferred email service
    // This is a placeholder - integrate with your email provider (SendGrid, Resend, etc.)
    const emailSent = await sendEmail({
      to: contactEmail,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (!emailSent) {
      throw new Error('Failed to send email');
    }

    // Log success
    console.log(`Email sent successfully to ${contactEmail} for ${firstName} ${lastName}`);

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Send email using your preferred email service provider
 * This is a placeholder function - implement based on your email provider
 */
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const emailProvider = process.env.EMAIL_PROVIDER || 'resend';

  if (emailProvider === 'resend') {
    return sendEmailViaResend({ to, subject, html, text });
  } else if (emailProvider === 'sendgrid') {
    return sendEmailViaSendGrid({ to, subject, html, text });
  } else if (emailProvider === 'test') {
    // Test mode - just log and return success
    console.log('TEST MODE - Email would be sent:', { to, subject });
    return true;
  }

  throw new Error(`Unsupported email provider: ${emailProvider}`);
}

/**
 * Send email via Resend (https://resend.com)
 */
async function sendEmailViaResend({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'notifications@hopenet.example.com';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return true;
}

/**
 * Send email via SendGrid (https://sendgrid.com)
 */
async function sendEmailViaSendGrid({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'notifications@hopenet.example.com';

  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not configured');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: { email: fromEmail },
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return true;
}
