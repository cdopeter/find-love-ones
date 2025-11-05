# Third-Party API Credentials Template

## 🔑 API Access Information

**API Provider:** HopeNet Missing Persons System  
**Contact:** [Your Name] - [your.email@domain.com]  
**Date Issued:** [Current Date]  
**Expires:** [Token Expiry Date]

---

## 🌐 Environment Details

### Production Environment
- **Base URL:** `https://hopenet.example.com/api/third-party`
- **Token:** `[PROVIDE_SECURELY_VIA_SEPARATE_CHANNEL]`
- **Token Type:** HMAC-SHA256 Signing Key
- **Rate Limit:** 60 requests per minute
---

## 🚀 Quick Start Command

Test your connection with this curl command:

```bash
# Replace YOUR_TOKEN_HERE with the provided token
TOKEN="YOUR_TOKEN_HERE"
URL="https://staging.hopenet.example.com/api/third-party"
PAYLOAD='{"table":"requests","action":"read","filters":{"status":"open"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$TOKEN" -hex | cut -d' ' -f2)

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**Expected Response:** `200 OK` with JSON containing request data

---

## 📋 Integration Checklist

- [ ] **Security Setup**
  - [ ] Store tokens in environment variables
  - [ ] Never commit tokens to version control
  - [ ] Set up token rotation reminders

- [ ] **Basic Integration**
  - [ ] Implement HMAC signature generation
  - [ ] Add error handling for common scenarios

- [ ] **Production Readiness**
  - [ ] Implement rate limiting respect
  - [ ] Add retry logic with exponential backoff
  - [ ] Set up monitoring and alerting
  - [ ] Review security practices

---

## 🔐 Security Requirements

### Mandatory Security Practices

1. **Token Storage**
   - Use environment variables or secure secret management
   - Different tokens for different environments
   - Never log or expose tokens in plaintext

2. **Request Signing**
   - Sign exact JSON payload being sent
   - Use lowercase hex format for signature
   - Include Content-Type: application/json header

3. **Error Handling**
   - Don't expose API errors to end users
   - Log errors for debugging (without sensitive data)
   - Implement appropriate retry logic

### Security Headers Required

```
Content-Type: application/json
X-Signature: <hmac_sha256_hex_signature>
Idempotency-Key: <unique_request_id>  (recommended)
```


---

## 📅 Important Dates

### Token Lifecycle
- **Token Created:** [Date]
- **Next Rotation:** [Date + 90 days]
- **Expiry Warning:** [Date + 76 days] (14 days notice)
- **Hard Expiry:** [Date + 90 days]

### API Versioning
- **Current Version:** v1.0
- **Breaking Changes Notice:** 6 months minimum
- **Deprecation Timeline:** TBD

---

## ⚠️ Important Notes

### Rate Limiting
- **Limit:** 60 requests per minute per token
- **Burst Capacity:** 60 tokens
- **Refill Rate:** 1 token per second
- **429 Response:** Includes Retry-After header

### Idempotency
- Use `Idempotency-Key` header for important operations
- Keys are valid for 24 hours
- Same key + different data = 409 Conflict error

### Field Restrictions
- **Requests table:** Limited update access, no personal requester data
- **Found_updates table:** Full read/write access
- See API documentation for complete field lists

---

## 🔄 Token Rotation Process

### Timeline (Standard 90-day rotation)
1. **Day -14:** Rotation announcement sent
2. **Day 0:** New token issued (dual-key period begins)
3. **Day 0-7:** Migration period (both tokens valid)
4. **Day 7:** Old token disabled
5. **Day 8:** Verification that only new token is in use

### Emergency Rotation
- Immediate token revocation if compromised
- New token issued within 1 hour
- API may be temporarily disabled during emergency rotation

---

## 📖 Documentation Links

- **[Main API Documentation](./third-party-api.md)** - Complete reference
- **[Code Examples](./THIRD_PARTY_EXAMPLES.md)** - Ready-to-use samples
- **[Error Handling](./THIRD_PARTY_ERROR_HANDLING.md)** - Best practices
- **[Testing Guide](./THIRD_PARTY_TESTING.md)** - Testing strategies
- **[Integration Package](./THIRD_PARTY_INTEGRATION_PACKAGE.md)** - Full setup guide

---

**Credentials Package Version:** 1.0  
**Generated:** [Current Date]  
**Valid Until:** [Token Expiry Date]  

---

## ✅ Acknowledgment

By using these API credentials, you acknowledge that you have:

- [ ] Read and understood the API documentation
- [ ] Implemented proper security practices
- [ ] Set up monitoring and error handling
- [ ] Scheduled token rotation processes
- [ ] Established support contact procedures

**Recipient Signature:** ______________________  
**Date:** ______________________  
**Organization:** ______________________