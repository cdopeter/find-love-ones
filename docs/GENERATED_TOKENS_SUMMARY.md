# Generated API Tokens Summary

**Generated:** November 5, 2025  
**Expires:** February 3, 2026 (90 days)  
**Security Level:** Excellent (512-bit entropy)  
**Algorithm:** HMAC-SHA256

## 🔑 Token Information

### Production Environment
- **Base URL:** `https://hopenet.example.com/api/third-party`
- **Token:** `d5b745189586c5b17e6c4ceafae7426d3a3500402e7a379915cd65656ebf7b4d357d545cefb631660986fb9ea84e45095192f9ec6023656cbf3101a0edbe1709`
- **Environment Variable:** `THIRD_PARTY_TOKEN_ACTIVE`

### Staging Environment  
- **Base URL:** `https://staging.hopenet.example.com/api/third-party`
- **Token:** `02a9be66f67f5f5e3a094a042c82206f441e6673fe8e5b2927ff712f75b6caf3bb6fd1c06e6dadd6e13cd1936018dcdab60d0feeb7971e898dbb6ba52535575b`
- **Environment Variable:** `THIRD_PARTY_TOKEN_STAGING`

### Development Environment
- **Base URL:** `https://dev.hopenet.example.com/api/third-party`
- **Token:** `8f44787d1614044a44b633f9964a563d24a41be6b035dcea8e3bcfc980cdb947ea5eaca20b6348a748a5f7c885472825b675b0cf112690330799f59910aad059`
- **Environment Variable:** `THIRD_PARTY_TOKEN_DEVELOPMENT`

## 📁 Generated Files

All tokens and credentials have been saved to:
`/scripts/generated-tokens/`

### Available Files:
- **`environment-variables.env`** - Server environment variables
- **`staging-credentials.txt`** - Staging credentials for third parties
- **`production-credentials.txt`** - Production credentials for third parties  
- **`full-token-set.json`** - Complete token metadata

## 🔧 Token Management

Use the token management script for ongoing operations:

```bash
# Check token status
node scripts/token-manager.js status

# Validate token security
node scripts/token-manager.js validate

# Generate rotation script
node scripts/token-manager.js rotate

# Create audit report
node scripts/token-manager.js audit
```

## 🚀 Quick Test Commands

### Staging Environment Test
```bash
TOKEN="02a9be66f67f5f5e3a094a042c82206f441e6673fe8e5b2927ff712f75b6caf3bb6fd1c06e6dadd6e13cd1936018dcdab60d0feeb7971e898dbb6ba52535575b"
URL="https://staging.hopenet.example.com/api/third-party"
PAYLOAD='{"table":"requests","action":"read","filters":{"status":"open"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$TOKEN" -hex | cut -d' ' -f2)

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Production Environment Test
```bash
TOKEN="d5b745189586c5b17e6c4ceafae7426d3a3500402e7a379915cd65656ebf7b4d357d545cefb631660986fb9ea84e45095192f9ec6023656cbf3101a0edbe1709"
URL="https://hopenet.example.com/api/third-party"
PAYLOAD='{"table":"requests","action":"read","filters":{"status":"open"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$TOKEN" -hex | cut -d' ' -f2)

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

## 🔐 Security Configuration

### Server Environment Variables
Add these to your deployment configuration:

```bash
# Production
THIRD_PARTY_TOKEN_ACTIVE="d5b745189586c5b17e6c4ceafae7426d3a3500402e7a379915cd65656ebf7b4d357d545cefb631660986fb9ea84e45095192f9ec6023656cbf3101a0edbe1709"

# Staging  
THIRD_PARTY_TOKEN_STAGING="02a9be66f67f5f5e3a094a042c82206f441e6673fe8e5b2927ff712f75b6caf3bb6fd1c06e6dadd6e13cd1936018dcdab60d0feeb7971e898dbb6ba52535575b"

# Development
THIRD_PARTY_TOKEN_DEVELOPMENT="8f44787d1614044a44b633f9964a563d24a41be6b035dcea8e3bcfc980cdb947ea5eaca20b6348a748a5f7c885472825b675b0cf112690330799f59910aad059"

# API Configuration
THIRD_PARTY_API_ENABLED=true
THIRD_PARTY_RATE_LIMIT=60
```

## 📋 Distribution Checklist

### For Third-Party Suppliers:
- [ ] Send `staging-credentials.txt` via secure channel
- [ ] Send `production-credentials.txt` via secure channel (when ready)
- [ ] Provide integration documentation package
- [ ] Schedule integration review meeting
- [ ] Set up monitoring and support channels

### For Internal Team:
- [ ] Update deployment with environment variables
- [ ] Configure API endpoint routing
- [ ] Set up token rotation reminders (90 days)
- [ ] Enable API monitoring and alerting
- [ ] Document support procedures

## 📅 Important Dates

- **Token Generated:** November 5, 2025
- **Rotation Warning:** January 20, 2026 (14 days before expiry)
- **Expiry Date:** February 3, 2026
- **Next Rotation:** Early February 2026

## ⚠️ Security Reminders

1. **Never commit tokens to version control**
2. **Store tokens in secure environment variables**
3. **Use different tokens for each environment**
4. **Monitor token usage for suspicious activity**
5. **Rotate tokens every 90 days**
6. **Revoke immediately if compromised**

---

**Status:** ✅ All tokens validated and ready for deployment  
**Security Level:** 🔒 Excellent (512-bit entropy)  
**Next Action:** Configure server environment variables