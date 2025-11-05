# Third-Party API Quick Start Guide

This guide will help you quickly set up and start using the HopeNet Third-Party API.

## Prerequisites

- Supabase project with service role key
- Node.js or Python environment for making API calls
- Access to run SQL commands in Supabase

## 1. Database Setup (One-time)

Run the SQL script in your Supabase SQL Editor:

```bash
# File: scripts/third-party-api-schema.sql
```

This creates:

- ✅ `audit_events` table for tracking all API operations
- ✅ `found_updates` table (if not exists)
- ✅ Database constraints and validation
- ✅ Row Level Security (RLS) policies
- ✅ Proper indexes for performance

## 2. Environment Configuration

Add these variables to your `.env.local`:

```env
# Required
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key_here
THIRD_PARTY_TOKEN_ACTIVE=your_generated_secure_random_token_here

# Optional
THIRD_PARTY_TOKEN_NEXT=token_for_rotation_when_needed
THIRD_PARTY_API_ENABLED=true
```

### Generating a Secure Token

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

## 3. Quick Test

### Test with cURL

```bash
# 1. Prepare your payload
PAYLOAD='{"table":"requests","action":"read","filters":{"parish":"Kingston"}}'

# 2. Generate HMAC signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "YOUR_TOKEN" | cut -d' ' -f2)

# 3. Make request
curl -X POST http://localhost:3000/api/third-party \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Test with Node.js

```javascript
const crypto = require('crypto');

const API_URL = 'http://localhost:3000/api/third-party';
const API_TOKEN = 'your_token_here';

async function makeRequest(payload) {
  const bodyText = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', API_TOKEN)
    .update(bodyText)
    .digest('hex');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'Idempotency-Key': `req-${Date.now()}`, // Optional
    },
    body: bodyText,
  });

  return response.json();
}

// Example: Read open requests in Kingston
makeRequest({
  table: 'requests',
  action: 'read',
  filters: { parish: 'Kingston', status: 'open' },
}).then(console.log);

// Example: Create a found update
makeRequest({
  table: 'found_updates',
  action: 'create',
  patch: {
    request_id: 'your-request-uuid',
    message_from_found_party: 'Person found safe and well',
    created_by: 'my_app_v1',
  },
}).then(console.log);

// Example: Update request status
makeRequest({
  table: 'requests',
  action: 'update',
  id: 'request-uuid',
  patch: { status: 'closed' },
}).then(console.log);
```

### Test with Python

```python
import hmac
import hashlib
import json
import requests

API_URL = 'http://localhost:3000/api/third-party'
API_TOKEN = 'your_token_here'

def make_request(payload):
    body_text = json.dumps(payload, separators=(',', ':'))
    signature = hmac.new(
        API_TOKEN.encode('utf-8'),
        body_text.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    response = requests.post(
        API_URL,
        headers={
            'Content-Type': 'application/json',
            'X-Signature': signature,
            'Idempotency-Key': f'req-{int(time.time())}',  # Optional
        },
        data=body_text
    )

    return response.json()

# Example: Read open requests
result = make_request({
    'table': 'requests',
    'action': 'read',
    'filters': {'status': 'open'}
})
print(result)

# Example: Create found update
result = make_request({
    'table': 'found_updates',
    'action': 'create',
    'patch': {
        'request_id': 'your-request-uuid',
        'message_from_found_party': 'Person found safe'
    }
})
print(result)
```

## 4. Understanding Access Control

### Requests Table

**You CAN access:**

- ✅ `id`, `created_at`
- ✅ `target_first_name`, `target_last_name`
- ✅ `last_known_address`, `parish`
- ✅ `lat`, `lng` (coordinates)
- ✅ `status` (open/closed)
- ✅ `message_to_person`

**You CANNOT access (privacy protected):**

- ❌ `requester_email`
- ❌ `requester_phone`
- ❌ `requester_first_name`, `requester_last_name`

### Found Updates Table

**Full access to all fields:**

- ✅ `id`, `created_at`
- ✅ `request_id`
- ✅ `message_from_found_party`
- ✅ `created_by`

## 5. Rate Limits

- **Limit:** 60 requests per minute
- **Bucket refill:** 1 token per second
- **Status:** Check `X-RateLimit-*` headers in responses

When rate limited:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 30
}
```

## 6. Error Handling

```javascript
async function makeRequestWithRetry(payload, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await makeRequest(payload);

      if (result.error) {
        if (result.error === 'Rate limit exceeded') {
          const delay = result.retryAfter * 1000 || 60000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## 7. Common Operations

### Search for Missing Persons

```javascript
// By parish
makeRequest({
  table: 'requests',
  action: 'read',
  filters: { parish: 'Kingston' },
});

// By status
makeRequest({
  table: 'requests',
  action: 'read',
  filters: { status: 'open' },
});

// Get specific request
makeRequest({
  table: 'requests',
  action: 'read',
  id: 'request-uuid-here',
});
```

### Report Person Found

```javascript
// 1. Create found update
makeRequest({
  table: 'found_updates',
  action: 'create',
  patch: {
    request_id: 'request-uuid',
    message_from_found_party: 'Found safe at local shelter. Family notified.',
    created_by: 'RedCross_App',
  },
});

// 2. Update request status to closed
makeRequest({
  table: 'requests',
  action: 'update',
  id: 'request-uuid',
  patch: { status: 'closed' },
});
```

### Update Request Information

```javascript
makeRequest({
  table: 'requests',
  action: 'update',
  id: 'request-uuid',
  patch: {
    last_known_address: 'Updated location',
    parish: 'St. Andrew',
  },
});
```

## 8. Security Best Practices

1. **Never commit tokens to version control**

   ```bash
   # Add to .gitignore
   .env.local
   .env*.local
   ```

2. **Use environment variables**

   ```javascript
   const API_TOKEN = process.env.THIRD_PARTY_TOKEN;
   if (!API_TOKEN) throw new Error('API_TOKEN not configured');
   ```

3. **Use HTTPS in production**

   ```javascript
   const API_URL =
     process.env.NODE_ENV === 'production'
       ? 'https://hopenet.example.com/api/third-party'
       : 'http://localhost:3000/api/third-party';
   ```

4. **Use idempotency keys for writes**

   ```javascript
   headers: {
     'Idempotency-Key': `${operation}-${uniqueId}-${timestamp}`
   }
   ```

5. **Implement exponential backoff**
   ```javascript
   const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
   ```

## 9. Monitoring

### Check Audit Logs

```sql
-- View recent API activity
SELECT
  created_at,
  actor,
  action,
  table_name,
  record_id
FROM audit_events
ORDER BY created_at DESC
LIMIT 100;

-- Check for errors (look at application logs)
```

### Monitor Rate Limits

- Track `X-RateLimit-Remaining` headers
- Alert when consistently hitting limits
- Consider upgrading limits if needed

## 10. Troubleshooting

### "Invalid signature" Error

- ✅ Verify token matches `THIRD_PARTY_TOKEN_ACTIVE`
- ✅ Ensure body is not modified between signing and sending
- ✅ Check for extra whitespace in JSON

### "Rate limit exceeded" Error

- ✅ Implement exponential backoff
- ✅ Batch operations when possible
- ✅ Use caching for frequently accessed data

### "Record not found" Error

- ✅ Verify UUID format is correct
- ✅ Check that record exists in database
- ✅ Ensure using correct table name

### "Missing required fields" Error

- ✅ Check `found_updates` requires `request_id` and `message_from_found_party`
- ✅ Verify all required fields are present

## 11. Full Documentation

For complete API documentation, see: `docs/third-party-api.md`

Includes:

- Complete header reference
- All error codes
- Advanced examples
- Key rotation procedures
- Field allowlists
- Change log

## 12. Support

- **Issues:** [GitHub Issues](https://github.com/cdopeter/find-love-ones/issues)
- **Documentation:** `docs/third-party-api.md`
- **Database Schema:** `scripts/third-party-api-schema.sql`

---

**Quick Links:**

- [Full API Documentation](../docs/third-party-api.md)
- [Database Schema](../scripts/third-party-api-schema.sql)
- [Environment Setup](../.env.example)
