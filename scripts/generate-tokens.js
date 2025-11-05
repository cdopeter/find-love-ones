#!/usr/bin/env node

/**
 * Token Generator for HopeNet Third-Party API
 * Generates cryptographically secure HMAC tokens for API authentication
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class TokenGenerator {
  constructor() {
    this.tokenLength = 64; // 64 bytes = 512 bits of entropy
  }

  /**
   * Generate a cryptographically secure random token
   * @returns {string} Hex-encoded token
   */
  generateToken() {
    return crypto.randomBytes(this.tokenLength).toString('hex');
  }

  /**
   * Generate tokens for all environments
   * @returns {object} Object containing tokens for different environments
   */
  generateTokenSet() {
    const timestamp = new Date().toISOString();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days from now

    return {
      metadata: {
        generated: timestamp,
        expires: expiryDate.toISOString(),
        version: '1.0',
        algorithm: 'HMAC-SHA256'
      },
      production: {
        token: this.generateToken(),
        environment: 'production',
        baseUrl: 'https://hopenet.example.com/api/third-party'
      },
      staging: {
        token: this.generateToken(),
        environment: 'staging',
        baseUrl: 'https://staging.hopenet.example.com/api/third-party'
      },
      development: {
        token: this.generateToken(),
        environment: 'development',
        baseUrl: 'https://dev.hopenet.example.com/api/third-party'
      }
    };
  }

  /**
   * Generate environment variables format
   * @param {object} tokenSet - Token set from generateTokenSet()
   * @returns {string} Environment variables format
   */
  generateEnvFormat(tokenSet) {
    return `# HopeNet Third-Party API Tokens
# Generated: ${tokenSet.metadata.generated}
# Expires: ${tokenSet.metadata.expires}

# Production Environment
THIRD_PARTY_TOKEN_ACTIVE="${tokenSet.production.token}"
HOPENET_PRODUCTION_BASE_URL="${tokenSet.production.baseUrl}"

# Staging Environment  
THIRD_PARTY_TOKEN_STAGING="${tokenSet.staging.token}"
HOPENET_STAGING_BASE_URL="${tokenSet.staging.baseUrl}"

# Development Environment
THIRD_PARTY_TOKEN_DEVELOPMENT="${tokenSet.development.token}"
HOPENET_DEVELOPMENT_BASE_URL="${tokenSet.development.baseUrl}"

# For token rotation (set when rotating)
# THIRD_PARTY_TOKEN_NEXT=""

# API Configuration
THIRD_PARTY_API_ENABLED=true
THIRD_PARTY_RATE_LIMIT=60
`;
  }

  /**
   * Generate secure delivery format for third parties
   * @param {object} tokenSet - Token set from generateTokenSet()
   * @param {string} environment - Which environment to format
   * @returns {string} Secure delivery format
   */
  generateSecureDelivery(tokenSet, environment = 'staging') {
    const envData = tokenSet[environment];
    
    return `# CONFIDENTIAL - HopeNet API Credentials
# Environment: ${environment.toUpperCase()}
# Generated: ${tokenSet.metadata.generated}
# Expires: ${tokenSet.metadata.expires}

## API Configuration
BASE_URL="${envData.baseUrl}"
API_TOKEN="${envData.token}"

## Security Notes
- Store this token securely (environment variables or secret management)
- Never commit to version control
- Rotate every 90 days
- Use HTTPS only
- Sign requests with HMAC-SHA256

## Quick Test Command
TOKEN="${envData.token}"
URL="${envData.baseUrl}"
PAYLOAD='{"table":"requests","action":"read","filters":{"status":"open"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$TOKEN" -hex | cut -d' ' -f2)

curl -X POST "$URL" \\
  -H "Content-Type: application/json" \\
  -H "X-Signature: $SIGNATURE" \\
  -d "$PAYLOAD"

# Expected: 200 OK with JSON response
`;
  }

  /**
   * Generate all output formats and save to files
   */
  generateAndSave() {
    const tokenSet = this.generateTokenSet();
    const outputDir = path.join(__dirname, 'generated-tokens');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate different formats
    const envFormat = this.generateEnvFormat(tokenSet);
    const stagingDelivery = this.generateSecureDelivery(tokenSet, 'staging');
    const productionDelivery = this.generateSecureDelivery(tokenSet, 'production');

    // Save files
    fs.writeFileSync(path.join(outputDir, 'environment-variables.env'), envFormat);
    fs.writeFileSync(path.join(outputDir, 'staging-credentials.txt'), stagingDelivery);
    fs.writeFileSync(path.join(outputDir, 'production-credentials.txt'), productionDelivery);
    fs.writeFileSync(path.join(outputDir, 'full-token-set.json'), JSON.stringify(tokenSet, null, 2));

    return {
      tokenSet,
      outputDir,
      files: [
        'environment-variables.env',
        'staging-credentials.txt', 
        'production-credentials.txt',
        'full-token-set.json'
      ]
    };
  }

  /**
   * Validate a token meets security requirements
   * @param {string} token - Token to validate
   * @returns {object} Validation result
   */
  validateToken(token) {
    const validation = {
      valid: true,
      issues: [],
      entropy: 0,
      strength: 'unknown'
    };

    // Check length
    if (token.length < 64) {
      validation.valid = false;
      validation.issues.push('Token too short (minimum 64 characters)');
    }

    // Check if hex encoded
    if (!/^[a-f0-9]+$/i.test(token)) {
      validation.valid = false;
      validation.issues.push('Token must be hex-encoded');
    }

    // Calculate entropy (simplified)
    validation.entropy = token.length * 4; // 4 bits per hex character
    
    if (validation.entropy >= 256) {
      validation.strength = 'strong';
    } else if (validation.entropy >= 128) {
      validation.strength = 'adequate';
    } else {
      validation.strength = 'weak';
      validation.valid = false;
      validation.issues.push('Insufficient entropy');
    }

    return validation;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new TokenGenerator();
  
  console.log('🔐 HopeNet Third-Party API Token Generator');
  console.log('==========================================\n');

  try {
    const result = generator.generateAndSave();
    
    console.log('✅ Tokens generated successfully!\n');
    console.log(`📁 Output directory: ${result.outputDir}\n`);
    
    console.log('📄 Generated files:');
    result.files.forEach(file => {
      console.log(`   - ${file}`);
    });
    
    console.log('\n🔒 Security Information:');
    console.log(`   - Token length: ${generator.tokenLength} bytes (${generator.tokenLength * 8} bits)`);
    console.log(`   - Algorithm: HMAC-SHA256`);
    console.log(`   - Expires: ${result.tokenSet.metadata.expires}`);
    
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   - Store tokens securely (never in version control)');
    console.log('   - Use different tokens for each environment');
    console.log('   - Rotate tokens every 90 days');
    console.log('   - Monitor token usage for suspicious activity');
    console.log('   - Revoke immediately if compromised');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Review generated tokens in the output directory');
    console.log('   2. Set environment variables in your deployment');
    console.log('   3. Securely distribute credentials to third parties');
    console.log('   4. Set up token rotation reminders');
    console.log('   5. Configure monitoring and alerting');
    
  } catch (error) {
    console.error('❌ Error generating tokens:', error.message);
    process.exit(1);
  }
}

export default TokenGenerator;