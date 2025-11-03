/**
 * Email template for notifying requester when person is marked as "found"
 */

export interface FoundNotificationData {
  contactName: string;
  firstName: string;
  lastName: string;
  lastSeenLocation: string;
  parish: string;
  messageFromFound?: string;
  dashboardUrl?: string;
}

/**
 * Generate HTML email template for found notification
 */
export function generateFoundNotificationHTML(data: FoundNotificationData): string {
  const {
    contactName,
    firstName,
    lastName,
    lastSeenLocation,
    parish,
    messageFromFound,
    dashboardUrl = 'https://hopenet.example.com/dashboard',
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Great News - Person Found</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .info-box {
      background-color: white;
      padding: 15px;
      margin: 15px 0;
      border-left: 4px solid #4CAF50;
      border-radius: 4px;
    }
    .message-box {
      background-color: #e8f5e9;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
      font-style: italic;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin: 15px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Great News!</h1>
  </div>
  <div class="content">
    <p>Dear ${contactName},</p>
    
    <p>We have wonderful news to share with you. The person you were looking for has been marked as <strong>found</strong>.</p>
    
    <div class="info-box">
      <strong>Person Details:</strong><br>
      <strong>Name:</strong> ${firstName} ${lastName}<br>
      <strong>Last Known Location:</strong> ${lastSeenLocation}<br>
      <strong>Parish:</strong> ${parish}
    </div>
    
    ${
      messageFromFound
        ? `
    <div class="message-box">
      <strong>Message:</strong><br>
      ${messageFromFound.replace(/\n/g, '<br>')}
    </div>
    `
        : ''
    }
    
    <p>Please check the dashboard for more details and any additional information that may have been added.</p>
    
    <center>
      <a href="${dashboardUrl}" class="button">View Dashboard</a>
    </center>
    
    <p>If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
    
    <p>Stay safe and connected,<br>
    The HopeNet Team</p>
  </div>
  
  <div class="footer">
    <p>This is an automated notification from HopeNet.<br>
    You received this email because you submitted a search request through our platform.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email template for found notification (fallback)
 */
export function generateFoundNotificationText(data: FoundNotificationData): string {
  const {
    contactName,
    firstName,
    lastName,
    lastSeenLocation,
    parish,
    messageFromFound,
    dashboardUrl = 'https://hopenet.example.com/dashboard',
  } = data;

  let text = `
Dear ${contactName},

Great News!

We have wonderful news to share with you. The person you were looking for has been marked as found.

Person Details:
- Name: ${firstName} ${lastName}
- Last Known Location: ${lastSeenLocation}
- Parish: ${parish}
`;

  if (messageFromFound) {
    text += `\nMessage:\n${messageFromFound}\n`;
  }

  text += `
Please check the dashboard for more details and any additional information that may have been added.

Dashboard URL: ${dashboardUrl}

If you have any questions or need further assistance, please don't hesitate to contact our support team.

Stay safe and connected,
The HopeNet Team

---
This is an automated notification from HopeNet.
You received this email because you submitted a search request through our platform.
  `.trim();

  return text;
}

/**
 * Get email subject for found notification
 */
export function getFoundNotificationSubject(firstName: string, lastName: string): string {
  return `Great News - ${firstName} ${lastName} Has Been Found`;
}
