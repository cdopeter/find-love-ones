# Third-Party API Documentation

## Overview

The HopeNet Third-Party API allows external applications to securely interact with the `requests` and `found_updates` tables in the Supabase database. This API enables third-party applications to read information about missing persons and submit updates when people are found.

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Idempotency](#idempotency)
4. [API Endpoints](#api-endpoints)
5. [Request Format](#request-format)
6. [Response Format](#response-format)
7. [Table Access](#table-access)
8. [Error Codes](#error-codes)
9. [Examples](#examples)
10. [Key Rotation](#key-rotation)
11. [Security Best Practices](#security-best-practices)
12. [Change Log](#change-log)

## Authentication

The API uses HMAC-SHA256 signature-based authentication to ensure request integrity and authenticity.

### Generating a Signature

1. Serialize your request body as JSON (with no extra whitespace)
2. Generate an HMAC-SHA256 signature of the body using your secret token
3. Include the signature in the `X-Signature` header as a hex string

**Example (Node.js):**

```javascript
const crypto = require('crypto');

const payload = JSON.stringify({
  table: 'found_updates',
  action: 'create',
  patch: {
    request_id: 'uuid-here',
    message_from_found_party: 'Person has been found safe',
  },
});

const signature = crypto
  .createHmac('sha256', process.env.THIRD_PARTY_TOKEN)
  .update(payload)
  .digest('hex');

// Include in request header: X-Signature: <signature>
```

**Example (Python):**

```python
import hmac
import hashlib
import json

payload = json.dumps({
    'table': 'found_updates',
    'action': 'create',
    'patch': {
        'request_id': 'uuid-here',
        'message_from_found_party': 'Person has been found safe'
    }
}, separators=(',', ':'))

signature = hmac.new(
    SECRET_TOKEN.encode('utf-8'),
    payload.encode('utf-8'),
    hashlib.sha256
).hexdigest()

# Include in request header: X-Signature: {signature}
```

### Required Headers

- `Content-Type: application/json`
- `X-Signature: <hmac_signature>`
- `Idempotency-Key: <unique_key>` (optional, recommended)

## Rate Limiting

The API implements a token bucket rate limiting algorithm:

- **Limit:** 60 requests per minute
- **Bucket capacity:** 60 tokens
- **Refill rate:** 1 token per second

### Rate Limit Headers

Response includes the following headers:

- `X-RateLimit-Limit`: Maximum requests per window (60)
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: ISO 8601 timestamp when the limit resets

### Rate Limit Exceeded

When rate limit is exceeded, the API returns:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 30
}
```

HTTP Status: `429 Too Many Requests`  
Headers: `Retry-After: 30`

## Idempotency

To prevent duplicate operations, include an `Idempotency-Key` header with a unique identifier:

```
Idempotency-Key: unique-request-id-12345
```

### Idempotency Behavior

- If a request with the same key is repeated within 24 hours, the cached response is returned
- The idempotency key must match the original request payload (table, id, and patch data)
- Using the same key with different data returns a `409 Conflict` error
- Replayed requests include the header: `X-Idempotency-Replay: true`

### Idempotency Key Format

- Must be alphanumeric with dashes and underscores only: `[a-zA-Z0-9_-]+`
- Maximum length: 255 characters
- Recommended: UUID v4 or timestamp-based unique ID

## API Endpoints

### POST /api/third-party

Main endpoint for all third-party API operations.

**Base URL:** `https://yourdomain.com/api/third-party`

## Request Format

### General Structure

```json
{
  "table": "requests | found_updates",
  "action": "create | read | update",
  "id": "uuid (required for update, optional for read)",
  "patch": {
    /* data to create/update */
  },
  "filters": {
    /* filters for read operations */
  }
}
```

### Field Descriptions

- **table** (string, required): The table to operate on (`requests` or `found_updates`)
- **action** (string, required): The operation to perform (`create`, `read`, or `update`)
- **id** (string, UUID): Required for `update`, optional for `read` (single record)
- **patch** (object): Required for `create` and `update` - contains the data
- **filters** (object): Optional for `read` - key-value pairs for filtering

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    /* created/updated/read record(s) */
  },
  "rejectedFields": ["field1", "field2"], // Optional: fields that were rejected
  "meta": {
    "auditEventId": "uuid",
    "timestamp": "2025-01-04T12:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "fields": ["field1"] // Optional: for validation errors
}
```

## Table Access

### Requests Table

**Table name:** `requests`

**Access Level:** Read-only for most fields, limited update access

**Allowed Fields for Read:**

- `id` (UUID, read-only)
- `created_at` (timestamp, read-only)
- `target_first_name` (string)
- `target_last_name` (string)
- `last_known_address` (string)
- `parish` (string, enum)
- `lat` (number, nullable)
- `lng` (number, nullable)
- `status` (string, enum: 'open' | 'closed')
- `gender` (string, enum: 'male' | 'female' | 'other' |'unspecified')
- `location_status` (string enum: 'unknown' |  'missing' | 'found' )
- `message_to_person` (string, nullable)
- `email_sent_at` (timestamp, read-only)

**Restricted Fields** (not accessible):

- `requester_email` - Protected for privacy
- `requester_phone` - Protected for privacy
- `requester_first_name` - Protected for privacy
- `requester_last_name` - Protected for privacy

**Allowed Fields for Update:**

- `target_first_name`
- `target_last_name`
- `last_known_address`
- `parish`
- `lat`
- `lng`
- `status`
- `message_to_person`

**Field Validation:**

- `parish`: Must be one of the 14 Jamaican parishes
- `status`: Must be 'open' or 'closed'
- `lat`: Must be between -90 and 90
- `lng`: Must be between -180 and 180

### Found Updates Table

**Table name:** `found_updates`

**Access Level:** Full read/write access

**Allowed Fields:**

- `id` (UUID, read-only)
- `request_id` (UUID, required for create)
- `message_from_found_party` (string, required, 1-5000 chars)
- `created_by` (string, optional)
- `created_at` (timestamp, read-only)

**Required Fields for Create:**

- `request_id`
- `message_from_found_party`

**Field Validation:**

- `message_from_found_party`: 1-5000 characters

## Error Codes

| Status Code | Error                 | Description                                                 |
| ----------- | --------------------- | ----------------------------------------------------------- |
| 400         | Bad Request           | Invalid request format, missing fields, or validation error |
| 401         | Unauthorized          | Missing or invalid signature                                |
| 404         | Not Found             | Record with specified ID not found                          |
| 409         | Conflict              | Idempotency key conflict                                    |
| 429         | Too Many Requests     | Rate limit exceeded                                         |
| 500         | Internal Server Error | Server error occurred                                       |
| 503         | Service Unavailable   | API is disabled for maintenance                             |

## Examples

### Example 1: Create Found Update

**Request:**

```bash
curl -X POST https://yourdomain.com/api/third-party \
  -H "Content-Type: application/json" \
  -H "X-Signature: a1b2c3..." \
  -H "Idempotency-Key: update-123-abc" \
  -d '{
    "table": "found_updates",
    "action": "create",
    "patch": {
      "request_id": "550e8400-e29b-41d4-a716-446655440000",
      "message_from_found_party": "Person has been found safe and is being reunited with family.",
      "created_by": "external_app_v1"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "message_from_found_party": "Person has been found safe and is being reunited with family.",
    "created_by": "external_app_v1",
    "created_at": "2025-01-04T12:00:00.000Z"
  },
  "meta": {
    "auditEventId": "770e8400-e29b-41d4-a716-446655440002",
    "timestamp": "2025-01-04T12:00:00.000Z"
  }
}
```

### Example 2: Update Request Status

**Request:**

```bash
curl -X POST https://yourdomain.com/api/third-party \
  -H "Content-Type: application/json" \
  -H "X-Signature: a1b2c3..." \
  -H "Idempotency-Key: status-update-456-def" \
  -d '{
    "table": "requests",
    "action": "update",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "patch": {
      "status": "closed"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-01T10:00:00.000Z",
    "target_first_name": "John",
    "target_last_name": "Doe",
    "last_known_address": "Downtown Kingston",
    "parish": "Kingston",
    "status": "closed",
    "message_to_person": "Please contact us",
    "lat": 18.0179,
    "lng": -76.8099,
    "email_sent_at": null
  },
  "meta": {
    "auditEventId": "880e8400-e29b-41d4-a716-446655440003",
    "timestamp": "2025-01-04T12:00:00.000Z"
  }
}
```

### Example 3: Read Requests

**Request:**

```bash
curl -X POST https://yourdomain.com/api/third-party \
  -H "Content-Type: application/json" \
  -H "X-Signature: a1b2c3..." \
  -d '{
    "table": "requests",
    "action": "read",
    "filters": {
      "parish": "Kingston",
      "status": "open"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-01-01T10:00:00.000Z",
      "target_first_name": "John",
      "target_last_name": "Doe",
      "last_known_address": "Downtown Kingston",
      "parish": "Kingston",
      "status": "open",
      "lat": 18.0179,
      "lng": -76.8099,
      "message_to_person": "Please contact us",
      "email_sent_at": null
    }
  ],
  "meta": {
    "auditEventId": "990e8400-e29b-41d4-a716-446655440004",
    "timestamp": "2025-01-04T12:00:00.000Z"
  }
}
```

### Example 4: Read Single Request by ID

**Request:**

```bash
curl -X POST https://yourdomain.com/api/third-party \
  -H "Content-Type: application/json" \
  -H "X-Signature: a1b2c3..." \
  -d '{
    "table": "requests",
    "action": "read",
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

## Key Rotation

The API supports dual-key authentication for seamless key rotation without downtime.

### Environment Variables

- `THIRD_PARTY_TOKEN_ACTIVE`: The current active token
- `THIRD_PARTY_TOKEN_NEXT`: The next token (for rotation)

### Rotation Process

1. **Preparation Phase**
   - Set `THIRD_PARTY_TOKEN_NEXT` to the new token value
   - Both old and new tokens are accepted
   - Inform third-party apps of the upcoming change

2. **Migration Period**
   - Third-party apps gradually migrate to the new token
   - Both tokens remain valid during this period
   - Monitor which key is being used via logs

3. **Completion Phase**
   - Move `THIRD_PARTY_TOKEN_NEXT` value to `THIRD_PARTY_TOKEN_ACTIVE`
   - Clear `THIRD_PARTY_TOKEN_NEXT`
   - Old token is no longer accepted

### Rotation Timeline (Recommended)

- **Day 0:** Announce rotation, set NEXT token
- **Day 1-7:** Migration period
- **Day 7:** Complete rotation, remove old token
- **Day 8+:** Only new token accepted

### Emergency Token Revocation

If a token is compromised:

1. Immediately update `THIRD_PARTY_TOKEN_ACTIVE` to a new secure token
2. Clear `THIRD_PARTY_TOKEN_NEXT`
3. Set `THIRD_PARTY_API_ENABLED=false` temporarily if needed
4. Notify third-party app owners
5. Monitor audit logs for suspicious activity

## Security Best Practices

### For API Consumers

1. **Token Security**
   - Never commit tokens to version control
   - Store tokens in secure environment variables
   - Rotate tokens regularly (every 90 days recommended)
   - Use different tokens for different environments

2. **Request Signing**
   - Always sign the exact request body being sent
   - Use constant-time comparison when verifying signatures
   - Include timestamps in idempotency keys to prevent replays

3. **Rate Limiting**
   - Implement exponential backoff when rate limited
   - Cache responses when appropriate
   - Batch operations when possible

4. **Error Handling**
   - Never expose raw error messages to end users
   - Log all errors for debugging
   - Implement retry logic with backoff

### For API Providers

1. **Token Management**
   - Use cryptographically secure random tokens (minimum 32 bytes)
   - Store tokens using secure secret management (e.g., AWS Secrets Manager)
   - Monitor token usage patterns
   - Implement token expiry dates

2. **Monitoring**
   - Track all API requests in audit logs
   - Alert on unusual patterns (high error rates, suspicious IPs)
   - Monitor rate limit violations
   - Review audit logs regularly

3. **Access Control**
   - Maintain IP allowlist if applicable
   - Review and update field allowlists regularly
   - Implement additional authentication layers for sensitive operations

## Maintenance Mode

The API can be disabled using the feature flag:

```env
THIRD_PARTY_API_ENABLED=false
```

When disabled, all requests return:

```json
{
  "error": "Service temporarily unavailable",
  "message": "The third-party API is currently disabled for maintenance"
}
```

HTTP Status: `503 Service Unavailable`  
Headers: `Retry-After: 3600`

## Change Log

### Version 1.0.0 (2025-01-04)

**Initial Release**

- HMAC-SHA256 authentication
- Rate limiting (60 req/min)
- Idempotency support
- Audit logging
- Table allowlists for `requests` and `found_updates`
- Dual-key rotation support
- Feature flag for maintenance mode

### Future Enhancements

Planned features for future versions:

- Webhook notifications for request status changes
- Batch operations support
- GraphQL endpoint
- OAuth2 authentication option
- Real-time updates via WebSockets
- Enhanced filtering and pagination
- Field-level permissions per token

## Support

For issues, questions, or feature requests:

- **GitHub Issues:** [github.com/cdopeter/find-love-ones/issues](https://github.com/cdopeter/find-love-ones/issues)
- **Documentation:** Check this file and the main README
- **Email:** support@hopenet.example.com (update with actual contact)

## License

This API is part of the HopeNet project and is licensed under the MIT License.
