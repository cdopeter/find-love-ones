#!/usr/bin/env node

/**
 * Test script for email notification system
 * 
 * This script helps test the email notification functionality
 * without needing to change actual database records.
 * 
 * Usage:
 *   node scripts/test-email.js
 * 
 * Or with environment variables:
 *   EMAIL_PROVIDER=test node scripts/test-email.js
 */

const testEmailNotification = async () => {
  console.log('🧪 Testing Email Notification System\n');

  // Test request data
  const testRequest = {
    requestId: 'test-123',
    contactName: 'Jane Doe',
    contactEmail: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    lastSeenLocation: 'Downtown Kingston',
    parish: 'Kingston',
    messageFromFound: 'I am safe and well. Thank you for your help!',
  };

  console.log('📧 Test Email Details:');
  console.log('   To:', testRequest.contactEmail);
  console.log('   Contact:', testRequest.contactName);
  console.log('   Person:', `${testRequest.firstName} ${testRequest.lastName}`);
  console.log('   Location:', testRequest.lastSeenLocation);
  console.log('   Parish:', testRequest.parish);
  console.log('   Message:', testRequest.messageFromFound);
  console.log('');

  // Check environment variables
  const emailProvider = process.env.EMAIL_PROVIDER || 'test';
  const edgeSecret = process.env.EDGE_FUNCTION_SECRET || 'test-secret';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  console.log('⚙️  Configuration:');
  console.log('   Email Provider:', emailProvider);
  console.log('   App URL:', appUrl);
  console.log('   Edge Secret:', edgeSecret ? '✓ Set' : '✗ Not set');
  console.log('');

  if (emailProvider !== 'test') {
    const apiKey =
      emailProvider === 'resend'
        ? process.env.RESEND_API_KEY
        : emailProvider === 'sendgrid'
          ? process.env.SENDGRID_API_KEY
          : null;

    console.log(`   ${emailProvider.toUpperCase()} API Key:`, apiKey ? '✓ Set' : '✗ Not set');
    console.log('');

    if (!apiKey) {
      console.log('⚠️  Warning: API key not set for', emailProvider);
      console.log('   Email sending will fail. Set EMAIL_PROVIDER=test for testing.\n');
    }
  }

  // Test the API endpoint
  console.log('📤 Sending test email...\n');

  try {
    const response = await fetch(`${appUrl}/api/send-found-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${edgeSecret}`,
      },
      body: JSON.stringify(testRequest),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log('   Response:', result);
      console.log('');
      console.log('   In test mode, check the console logs for email content.');
      console.log('   In production mode, check the recipient\'s inbox.');
    } else {
      console.log('❌ Failed!');
      console.log('   Status:', response.status);
      console.log('   Error:', result);
      console.log('');
      console.log('   Common issues:');
      console.log('   - Server not running (npm run dev)');
      console.log('   - Wrong EDGE_FUNCTION_SECRET');
      console.log('   - Missing email provider API key');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Network Error!');
    console.log('   Error:', error.message);
    console.log('');
    console.log('   Make sure the development server is running:');
    console.log('   npm run dev');
    process.exit(1);
  }
};

// Run the test
testEmailNotification().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
