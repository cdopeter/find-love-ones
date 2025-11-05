#!/usr/bin/env node

/**
 * Token Management Script for HopeNet Third-Party API
 * Handles token rotation, validation, and monitoring
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class TokenManager {
  constructor() {
    this.tokenDir = path.join(__dirname, 'generated-tokens');
    this.rotationWarningDays = 14;
  }

  /**
   * Load existing token set from file
   * @returns {object|null} Token set or null if not found
   */
  loadTokenSet() {
    const tokenFile = path.join(this.tokenDir, 'full-token-set.json');
    
    if (!fs.existsSync(tokenFile)) {
      return null;
    }

    try {
      const data = fs.readFileSync(tokenFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading token set:', error.message);
      return null;
    }
  }

  /**
   * Check if tokens need rotation
   * @returns {object} Rotation status
   */
  checkRotationStatus() {
    const tokenSet = this.loadTokenSet();
    
    if (!tokenSet) {
      return {
        status: 'unknown',
        message: 'No token set found'
      };
    }

    const expiryDate = new Date(tokenSet.metadata.expires);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) {
      return {
        status: 'expired',
        message: 'Tokens have expired and must be rotated immediately',
        daysUntilExpiry,
        urgency: 'critical'
      };
    } else if (daysUntilExpiry <= this.rotationWarningDays) {
      return {
        status: 'warning',
        message: `Tokens expire in ${daysUntilExpiry} days - rotation recommended`,
        daysUntilExpiry,
        urgency: 'high'
      };
    } else {
      return {
        status: 'ok',
        message: `Tokens are valid for ${daysUntilExpiry} more days`,
        daysUntilExpiry,
        urgency: 'low'
      };
    }
  }

  /**
   * Generate rotation script for zero-downtime rotation
   * @returns {string} Bash script for rotation
   */
  generateRotationScript() {
    const tokenSet = this.loadTokenSet();
    
    if (!tokenSet) {
      throw new Error('No existing token set found');
    }

    const newToken = crypto.randomBytes(64).toString('hex');
    
    return `#!/bin/bash
# HopeNet API Token Rotation Script
# Generated: ${new Date().toISOString()}

echo "🔄 Starting HopeNet API token rotation..."

# Step 1: Set the new token as NEXT token (dual-key period)
echo "Setting new token as NEXT token..."

# Export new token for verification
export NEW_TOKEN="${newToken}"

# Step 2: Update environment variables (adapt to your deployment)
# For Docker:
# docker exec -it your-container env THIRD_PARTY_TOKEN_NEXT="$NEW_TOKEN"

# For Kubernetes:
# kubectl patch secret api-tokens -p='{"data":{"THIRD_PARTY_TOKEN_NEXT":"'$(echo -n "$NEW_TOKEN" | base64)'"}}'

# For systemd service:
# sudo systemctl edit your-service
# [Service]
# Environment="THIRD_PARTY_TOKEN_NEXT=$NEW_TOKEN"

echo "⚠️  Manual step required:"
echo "   Set THIRD_PARTY_TOKEN_NEXT=$NEW_TOKEN in your deployment"
echo ""
echo "🕐 Wait 7 days for third parties to migrate to new token"
echo ""
echo "After migration period, run the completion script:"
echo "   ./complete-rotation.sh"

# Generate completion script
cat > complete-rotation.sh << 'EOF'
#!/bin/bash
echo "🔄 Completing token rotation..."

# Move NEXT token to ACTIVE
export OLD_TOKEN="${tokenSet.production.token}"
export NEW_TOKEN="$NEW_TOKEN"

echo "Moving new token to active..."
# Update THIRD_PARTY_TOKEN_ACTIVE=$NEW_TOKEN
# Remove THIRD_PARTY_TOKEN_NEXT

echo "✅ Token rotation completed"
echo "🗑️  Old token revoked: \${OLD_TOKEN:0:16}..."
echo "✅ New token active: \${NEW_TOKEN:0:16}..."

# Clean up
rm -f complete-rotation.sh
EOF

chmod +x complete-rotation.sh
echo "📝 Completion script generated: complete-rotation.sh"
`;
  }

  /**
   * Generate audit report of token usage
   * @returns {string} Audit report
   */
  generateAuditReport() {
    const tokenSet = this.loadTokenSet();
    const rotationStatus = this.checkRotationStatus();
    
    return `# HopeNet API Token Audit Report
Generated: ${new Date().toISOString()}

## Token Status
- **Status:** ${rotationStatus.status.toUpperCase()}
- **Message:** ${rotationStatus.message}
- **Urgency:** ${rotationStatus.urgency.toUpperCase()}
- **Days until expiry:** ${rotationStatus.daysUntilExpiry || 'Unknown'}

## Token Information
${tokenSet ? `
- **Generated:** ${tokenSet.metadata.generated}
- **Expires:** ${tokenSet.metadata.expires}
- **Algorithm:** ${tokenSet.metadata.algorithm}
- **Version:** ${tokenSet.metadata.version}

### Environment Tokens
- **Production:** ${tokenSet.production.token.substring(0, 16)}...
- **Staging:** ${tokenSet.staging.token.substring(0, 16)}...
- **Development:** ${tokenSet.development.token.substring(0, 16)}...
` : 'No token set found'}

## Security Recommendations
${rotationStatus.status === 'expired' ? `
⚠️  **CRITICAL:** Tokens have expired!
- Generate new tokens immediately
- Notify all third parties
- Review audit logs for failed authentication attempts
` : rotationStatus.status === 'warning' ? `
⚠️  **WARNING:** Tokens expiring soon!
- Start rotation process within ${Math.max(0, rotationStatus.daysUntilExpiry - 7)} days
- Notify third parties of upcoming rotation
- Prepare new tokens for deployment
` : `
✅ **OK:** Tokens are current
- Monitor usage patterns
- Review third-party access logs
- Plan next rotation for ${new Date(new Date().getTime() + (rotationStatus.daysUntilExpiry - 14) * 24 * 60 * 60 * 1000).toDateString()}
`}

## Next Actions
1. ${rotationStatus.status === 'expired' ? 'Generate new tokens immediately' : 'Monitor token status'}
2. Review API access logs
3. Verify third-party integrations are working
4. ${rotationStatus.status === 'warning' ? 'Prepare rotation communication' : 'Schedule next audit review'}

---
*Report generated by HopeNet Token Management System*
`;
  }

  /**
   * Validate all tokens in the current set
   * @returns {object} Validation results
   */
  validateCurrentTokens() {
    const tokenSet = this.loadTokenSet();
    
    if (!tokenSet) {
      return {
        valid: false,
        message: 'No token set found'
      };
    }

    const results = {
      overall: true,
      tokens: {},
      issues: []
    };

    ['production', 'staging', 'development'].forEach(env => {
      const token = tokenSet[env].token;
      const validation = this.validateToken(token);
      
      results.tokens[env] = validation;
      
      if (!validation.valid) {
        results.overall = false;
        results.issues.push(`${env}: ${validation.issues.join(', ')}`);
      }
    });

    return results;
  }

  /**
   * Validate a single token
   * @param {string} token - Token to validate
   * @returns {object} Validation result
   */
  validateToken(token) {
    const validation = {
      valid: true,
      issues: [],
      length: token.length,
      entropy: token.length * 4, // 4 bits per hex char
      strength: 'unknown'
    };

    if (token.length < 128) {
      validation.valid = false;
      validation.issues.push(`Token too short: ${token.length} chars (minimum 128)`);
    }

    if (!/^[a-f0-9]+$/i.test(token)) {
      validation.valid = false;
      validation.issues.push('Token must be hex-encoded');
    }

    // Determine strength
    if (validation.entropy >= 512) {
      validation.strength = 'excellent';
    } else if (validation.entropy >= 256) {
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
  const manager = new TokenManager();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'status':
        console.log('🔍 Token Status Check');
        console.log('====================\n');
        
        const status = manager.checkRotationStatus();
        const urgencyIcon = {
          critical: '🚨',
          high: '⚠️',
          low: '✅'
        };
        
        console.log(`${urgencyIcon[status.urgency]} ${status.message}`);
        
        if (status.daysUntilExpiry !== undefined) {
          console.log(`📅 Days until expiry: ${status.daysUntilExpiry}`);
        }
        break;

      case 'validate':
        console.log('🔒 Token Validation');
        console.log('===================\n');
        
        const validation = manager.validateCurrentTokens();
        
        if (validation.overall) {
          console.log('✅ All tokens are valid');
        } else {
          console.log('❌ Token validation failed:');
          validation.issues.forEach(issue => console.log(`   - ${issue}`));
        }
        
        Object.entries(validation.tokens).forEach(([env, result]) => {
          const icon = result.valid ? '✅' : '❌';
          console.log(`${icon} ${env}: ${result.strength} (${result.entropy} bits)`);
        });
        break;

      case 'rotate':
        console.log('🔄 Token Rotation');
        console.log('==================\n');
        
        const rotationScript = manager.generateRotationScript();
        const scriptPath = path.join(manager.tokenDir, 'rotate-tokens.sh');
        
        fs.writeFileSync(scriptPath, rotationScript);
        fs.chmodSync(scriptPath, '755');
        
        console.log('✅ Rotation script generated');
        console.log(`📝 Script location: ${scriptPath}`);
        console.log('\n📋 Next steps:');
        console.log('   1. Review the rotation script');
        console.log('   2. Execute: ./rotate-tokens.sh');
        console.log('   3. Update your deployment with new token');
        console.log('   4. Wait 7 days for migration');
        console.log('   5. Complete rotation with generated completion script');
        break;

      case 'audit':
        console.log('📊 Token Audit Report');
        console.log('=====================\n');
        
        const report = manager.generateAuditReport();
        const reportPath = path.join(manager.tokenDir, `audit-report-${new Date().toISOString().split('T')[0]}.md`);
        
        fs.writeFileSync(reportPath, report);
        console.log(report);
        console.log(`\n📄 Report saved to: ${reportPath}`);
        break;

      default:
        console.log('🔐 HopeNet Token Management');
        console.log('===========================\n');
        console.log('Available commands:');
        console.log('   status    - Check token expiry status');
        console.log('   validate  - Validate all current tokens');
        console.log('   rotate    - Generate token rotation script');
        console.log('   audit     - Generate comprehensive audit report');
        console.log('\nUsage:');
        console.log('   node token-manager.js <command>');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

export default TokenManager;