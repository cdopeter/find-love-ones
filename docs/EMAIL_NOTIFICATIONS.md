# Email Notification System

This document describes the email notification system that triggers when a person's status changes to "found".

## Features

1. **Automatic Email Notifications**: When a missing person's status is changed to "found", an email is automatically sent to the contact email address.

2. **Email Templates**: Professional HTML and plain text email templates with person details and optional messages.

3. **Audit Logging**: All status changes are logged with who made the change and when.

4. **Test Hooks**: Functions to test email sending without changing actual data.

## Architecture

### Components

1. **Email Templates** (`src/lib/email/templates.ts`)
   - HTML and text email templates
   - Configurable data fields
   - Professional styling

2. **Edge Function** (`src/app/api/send-found-notification/route.ts`)
   - Next.js Edge Runtime API endpoint
   - Supports multiple email providers (Resend, SendGrid, Test mode)
   - Secure with API key authentication

3. **Notification Service** (`src/lib/services/notification.ts`)
   - Handles status change notifications
   - Triggers email sending
   - Includes test hooks

4. **Audit Logging** (`src/lib/utils/audit.ts`)
   - Logs all status changes to database
   - Tracks who, when, and what changed
   - Query functions for audit history

5. **Database Schema** (`scripts/schema-updates.sql`)
   - Audit table for status changes
   - Email tracking fields
   - Database triggers (optional)

## Setup

### 1. Database Setup

Run the SQL in `scripts/schema-updates.sql` in your Supabase SQL editor to create:
- `status_change_audit` table
- Add `email_sent_at` field to `missing_person_requests`
- Optional: Database triggers for automatic notifications

### 2. Environment Variables

Add the following to your `.env.local` file:

```bash
# Email Provider
EMAIL_PROVIDER=test  # Options: 'resend', 'sendgrid', 'test'
EMAIL_FROM=notifications@hopenet.example.com

# For Resend (https://resend.com)
RESEND_API_KEY=your_resend_api_key

# For SendGrid (https://sendgrid.com)
SENDGRID_API_KEY=your_sendgrid_api_key

# Edge Function Security
EDGE_FUNCTION_SECRET=your_secret_key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000/dashboard
```

### 3. Email Provider Setup

#### Test Mode (Default)
Set `EMAIL_PROVIDER=test` to log emails to console without sending.

#### Resend
1. Sign up at https://resend.com
2. Get your API key
3. Set `EMAIL_PROVIDER=resend` and `RESEND_API_KEY=your_key`

#### SendGrid
1. Sign up at https://sendgrid.com
2. Get your API key
3. Set `EMAIL_PROVIDER=sendgrid` and `SENDGRID_API_KEY=your_key`

## Usage

### Automatic Notifications

When you change a person's status to "found" in the dashboard, the system automatically:

1. Updates the status in the database
2. Logs the change to the audit table
3. Sends an email notification to the contact email (if provided)

### Testing Email Sending

You can test email sending without changing status:

```typescript
import { testFoundNotification } from '@/lib/services/notification';
import { MissingPersonRequest } from '@/lib/types/database';

// Create a test request
const testRequest: MissingPersonRequest = {
  id: 'test-id',
  first_name: 'John',
  last_name: 'Doe',
  contact_name: 'Jane Doe',
  contact_email: 'test@example.com',
  last_seen_location: 'Downtown Kingston',
  parish: 'Kingston',
  status: 'found',
};

// Test the notification
const result = await testFoundNotification(testRequest);
if (result.success) {
  console.log('Email sent successfully!');
} else {
  console.error('Email failed:', result.error);
}
```

### Manual API Testing

You can test the Edge Function directly with curl:

```bash
curl -X POST http://localhost:3000/api/send-found-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key" \
  -d '{
    "requestId": "test-id",
    "contactName": "Jane Doe",
    "contactEmail": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "lastSeenLocation": "Downtown Kingston",
    "parish": "Kingston",
    "messageFromFound": "I am safe and well. Thank you for your help!"
  }'
```

### Viewing Audit Logs

To view audit logs for a specific request:

```typescript
import { getAuditHistory } from '@/lib/utils/audit';

const logs = await getAuditHistory('request-id');
console.log('Audit history:', logs);
```

To view recent audit logs across all requests:

```typescript
import { getRecentAuditLogs } from '@/lib/utils/audit';

const recentLogs = await getRecentAuditLogs(50);
console.log('Recent audit logs:', recentLogs);
```

## Email Template

The email template includes:
- Professional header with celebration emoji
- Person details (name, location, parish)
- Optional message from the found party
- Link to the dashboard
- Footer with contact information

### Preview

Subject: `Great News - John Doe Has Been Found`

Body includes:
- Personalized greeting to the contact
- Information about the found person
- Any message left by the found party
- Button to view the dashboard
- Contact information for support

## Security

1. **API Authentication**: Edge Function requires a secret key in the Authorization header
2. **Row Level Security**: Audit logs use Supabase RLS policies
3. **Environment Variables**: Sensitive keys are stored in environment variables
4. **Input Validation**: All inputs are validated before processing

## Troubleshooting

### Email not sending

1. Check `EMAIL_PROVIDER` is set correctly in `.env.local`
2. Verify API keys are correct
3. Check console logs for error messages
4. Ensure `contact_email` is set on the request
5. Verify `EDGE_FUNCTION_SECRET` matches between client and server

### Audit logs not appearing

1. Ensure `status_change_audit` table is created
2. Check Supabase RLS policies
3. Verify database connection
4. Check console for error messages

### Test mode

Set `EMAIL_PROVIDER=test` to test the system without sending actual emails. Emails will be logged to the console instead.

## Future Enhancements

- [ ] Support for more email providers (AWS SES, Mailgun, etc.)
- [ ] Email templates for other status changes
- [ ] Configurable email templates via admin panel
- [ ] Email delivery tracking and retry logic
- [ ] Batch notifications for multiple status changes
- [ ] SMS notifications
- [ ] Push notifications
