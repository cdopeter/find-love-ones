# Third-Party Integration Package
## HopeNet Missing Persons API

This package contains everything a third-party supplier needs to integrate with the HopeNet API.

---

## 📋 Quick Start Checklist

- [ ] Review API documentation (`third-party-api.md`)
- [ ] Set up authentication with provided credentials
- [ ] Test connection with sample code
- [ ] Implement error handling and retry logic
- [ ] Schedule token rotation process
- [ ] Set up monitoring and logging

---

## 🔑 API Credentials

**⚠️ CONFIDENTIAL - Handle with Care**

### Production Environment
- **Base URL:** `https://hopenet.example.com/api/third-party`
- **Token:** `[TO_BE_PROVIDED_SECURELY]`
- **Token Expires:** `[DATE]`

### Staging Environment  
- **Base URL:** `https://staging.hopenet.example.com/api/third-party`
- **Token:** `[TO_BE_PROVIDED_SECURELY]`
- **Token Expires:** `[DATE]`

### Rate Limits
- **Limit:** 60 requests per minute
- **Burst:** 60 tokens in bucket
- **Refill:** 1 token per second

---

## 🚀 Quick Integration Test

### Step 1: Test Authentication
```bash
# Replace YOUR_TOKEN with provided credentials
curl -X POST https://staging.hopenet.example.com/api/third-party \
  -H "Content-Type: application/json" \
  -H "X-Signature: $(echo -n '{"table":"requests","action":"read","filters":{"status":"open"}}' | openssl dgst -sha256 -hmac 'YOUR_TOKEN' -hex | cut -d' ' -f2)" \
  -d '{"table":"requests","action":"read","filters":{"status":"open"}}'
```

### Step 2: Verify Response
Expected: `200 OK` with JSON response containing request data.

---

## 📖 Key Documentation Files

1. **[Main API Documentation](./third-party-api.md)** - Complete API reference
2. **[Code Examples](./THIRD_PARTY_EXAMPLES.md)** - Ready-to-use code samples
3. **[Error Handling Guide](./THIRD_PARTY_ERROR_HANDLING.md)** - Best practices
4. **[Testing Guide](./THIRD_PARTY_TESTING.md)** - Testing strategies

---

## 🔐 Security Requirements

### Token Security
- Store tokens in environment variables or secure secret management
- Never commit tokens to version control
- Rotate tokens every 90 days
- Use different tokens for different environments

### Request Signing
- Always sign the exact JSON payload being sent
- Use constant-time comparison for signature verification
- Include `Idempotency-Key` headers for important operations


## 📅 Implementation Timeline

### Week 1: Setup & Testing
- [ ] Environment setup
- [ ] Authentication testing
- [ ] Basic read operations
- [ ] Error handling implementation

### Week 2: Core Integration
- [ ] Create found_updates functionality
- [ ] Update requests functionality  
- [ ] Idempotency implementation
- [ ] Rate limiting handling

### Week 3: Production Readiness
- [ ] Security review
- [ ] Performance testing
- [ ] Monitoring setup
- [ ] Documentation review

### Week 4: Go Live
- [ ] Production deployment
- [ ] Go-live testing
- [ ] Performance monitoring
- [ ] Post-launch review

---

## 🔄 Maintenance & Updates

### Token Rotation Schedule
- **Notification:** 14 days before expiry
- **Dual-key period:** 7 days
- **Old token removal:** Day 7
- **Verification:** Day 8

### API Updates
- **Minor updates:** Monthly
- **Major updates:** Quarterly  
- **Breaking changes:** 6+ months notice

---

## ✅ Pre-Production Checklist

### Security
- [ ] Tokens stored securely
- [ ] HTTPS only
- [ ] Request signing implemented
- [ ] Error messages don't expose sensitive data

### Reliability  
- [ ] Retry logic with exponential backoff
- [ ] Circuit breaker pattern implemented
- [ ] Timeout handling
- [ ] Rate limit respect

### Monitoring
- [ ] Request/response logging
- [ ] Error rate monitoring
- [ ] Performance metrics
- [ ] Alert setup

### Testing
- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] Load testing completed
- [ ] Error scenarios tested

---

**Package Created:** November 5, 2025  
**Version:** 1.0  
**Valid Until:** [Token Expiry Date]