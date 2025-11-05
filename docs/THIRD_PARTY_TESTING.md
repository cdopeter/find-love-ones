# Third-Party API Testing Guide

## Testing Strategy Overview

This guide provides comprehensive testing approaches for integrating with the HopeNet API.

## Pre-Integration Testing

### 1. Authentication Test

Verify your authentication setup works correctly:

```bash
#!/bin/bash
# Test script: test_auth.sh

API_URL="https://staging.hopenet.example.com/api/third-party"
TOKEN="your-staging-token-here"

# Simple payload
PAYLOAD='{"table":"requests","action":"read","filters":{"status":"open"}}'

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$TOKEN" -hex | cut -d' ' -f2)

# Make request
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  -v

echo "Expected: 200 OK with JSON response"
```

### 2. Rate Limit Test

Test rate limiting behavior:

```javascript
// rate_limit_test.js
const HopeNetAPI = require('./hopenet-api');

async function testRateLimit() {
  const client = new HopeNetAPI(
    'https://staging.hopenet.example.com/api/third-party',
    process.env.HOPENET_STAGING_TOKEN
  );

  const requests = [];
  const startTime = Date.now();

  // Send 65 requests rapidly (should hit rate limit)
  for (let i = 0; i < 65; i++) {
    requests.push(
      client.makeRequest({
        table: 'requests',
        action: 'read',
        filters: { status: 'open' }
      }).catch(error => ({ error: error.message, request: i }))
    );
  }

  const results = await Promise.all(requests);
  const duration = Date.now() - startTime;

  const errors = results.filter(r => r.error);
  const successes = results.filter(r => !r.error);

  console.log(`Test completed in ${duration}ms`);
  console.log(`Successful requests: ${successes.length}`);
  console.log(`Failed requests: ${errors.length}`);
  console.log(`Rate limit errors: ${errors.filter(e => e.error.includes('429')).length}`);
}

testRateLimit().catch(console.error);
```

## Unit Testing

### Test Suite Setup (Jest)

```javascript
// __tests__/hopenet-api.test.js
const HopeNetAPI = require('../src/hopenet-api');
const crypto = require('crypto');

describe('HopeNetAPI', () => {
  let client;
  const mockToken = 'test-token-123';
  const mockBaseUrl = 'https://test.example.com/api';

  beforeEach(() => {
    client = new HopeNetAPI(mockBaseUrl, mockToken);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('generateSignature', () => {
    test('generates correct HMAC-SHA256 signature', () => {
      const payload = '{"test":"data"}';
      const expectedSignature = crypto
        .createHmac('sha256', mockToken)
        .update(payload)
        .digest('hex');

      const signature = client.generateSignature(payload);
      expect(signature).toBe(expectedSignature);
    });

    test('different payloads generate different signatures', () => {
      const sig1 = client.generateSignature('{"a":"1"}');
      const sig2 = client.generateSignature('{"a":"2"}');
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('makeRequest', () => {
    test('sends correct headers and payload', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const requestData = { table: 'requests', action: 'read' };
      await client.makeRequest(requestData);

      expect(global.fetch).toHaveBeenCalledWith(
        mockBaseUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Signature': expect.any(String)
          }),
          body: JSON.stringify(requestData)
        })
      );
    });

    test('includes idempotency key when provided', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const idempotencyKey = 'test-key-123';
      await client.makeRequest({ table: 'requests', action: 'read' }, idempotencyKey);

      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers['Idempotency-Key']).toBe(idempotencyKey);
    });

    test('throws error on non-ok response', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Bad Request', message: 'Invalid data' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      await expect(client.makeRequest({ table: 'requests', action: 'read' }))
        .rejects.toThrow('API Error: Invalid data');
    });
  });
});
```

### Validation Tests

```javascript
// __tests__/validation.test.js
describe('Request Validation', () => {
  test('validates parish names', () => {
    const validParishes = [
      'Kingston', 'St. Andrew', 'St. Thomas', 'Portland',
      'St. Mary', 'St. Ann', 'Trelawny', 'St. James',
      'Hanover', 'Westmoreland', 'St. Elizabeth', 'Manchester',
      'Clarendon', 'St. Catherine'
    ];

    validParishes.forEach(parish => {
      expect(() => validateParish(parish)).not.toThrow();
    });

    expect(() => validateParish('Invalid Parish')).toThrow();
  });

  test('validates status values', () => {
    expect(() => validateStatus('open')).not.toThrow();
    expect(() => validateStatus('closed')).not.toThrow();
    expect(() => validateStatus('invalid')).toThrow();
  });

  test('validates coordinates', () => {
    expect(() => validateCoordinates(18.0179, -76.8099)).not.toThrow();
    expect(() => validateCoordinates(91, 0)).toThrow(); // Invalid latitude
    expect(() => validateCoordinates(0, 181)).toThrow(); // Invalid longitude
  });
});
```

## Integration Testing

### End-to-End Test Suite

```javascript
// __tests__/integration.test.js
const HopeNetAPI = require('../src/hopenet-api');

describe('Integration Tests', () => {
  let client;
  const testRequestId = process.env.TEST_REQUEST_ID;

  beforeAll(() => {
    if (!process.env.HOPENET_STAGING_TOKEN) {
      throw new Error('HOPENET_STAGING_TOKEN environment variable required');
    }

    client = new HopeNetAPI(
      'https://staging.hopenet.example.com/api/third-party',
      process.env.HOPENET_STAGING_TOKEN
    );
  });

  describe('Found Updates', () => {
    test('can create found update', async () => {
      const foundUpdate = {
        request_id: testRequestId,
        message_from_found_party: 'Integration test - person found safe',
        created_by: 'automated_test'
      };

      const result = await client.makeRequest({
        table: 'found_updates',
        action: 'create',
        patch: foundUpdate
      }, `test-${Date.now()}`);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.request_id).toBe(testRequestId);
      expect(result.data.message_from_found_party).toBe(foundUpdate.message_from_found_party);
    });

    test('handles duplicate idempotency key correctly', async () => {
      const idempotencyKey = `duplicate-test-${Date.now()}`;
      const foundUpdate = {
        request_id: testRequestId,
        message_from_found_party: 'Duplicate test message',
        created_by: 'automated_test'
      };

      // First request
      const result1 = await client.makeRequest({
        table: 'found_updates',
        action: 'create',
        patch: foundUpdate
      }, idempotencyKey);

      // Second request with same key and data
      const result2 = await client.makeRequest({
        table: 'found_updates',
        action: 'create',
        patch: foundUpdate
      }, idempotencyKey);

      expect(result1.data.id).toBe(result2.data.id);
    });
  });

  describe('Request Updates', () => {
    test('can update request status', async () => {
      const result = await client.makeRequest({
        table: 'requests',
        action: 'update',
        id: testRequestId,
        patch: { status: 'closed' }
      }, `status-update-test-${Date.now()}`);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('closed');
    });

    test('can read specific request', async () => {
      const result = await client.makeRequest({
        table: 'requests',
        action: 'read',
        id: testRequestId
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(testRequestId);
      expect(result.data).toHaveProperty('target_first_name');
      expect(result.data).toHaveProperty('target_last_name');
    });
  });

  describe('Error Scenarios', () => {
    test('handles invalid request ID gracefully', async () => {
      await expect(client.makeRequest({
        table: 'requests',
        action: 'read',
        id: 'invalid-uuid'
      })).rejects.toThrow();
    });

    test('handles invalid parish name', async () => {
      await expect(client.makeRequest({
        table: 'requests',
        action: 'update',
        id: testRequestId,
        patch: { parish: 'Invalid Parish' }
      })).rejects.toThrow();
    });
  });
});
```

## Load Testing

### Artillery Configuration

```yaml
# load-test.yml
config:
  target: 'https://staging.hopenet.example.com'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Sustained load"
    - duration: 60
      arrivalRate: 20
      name: "Peak load"
  processor: "./load-test-processor.js"

scenarios:
  - name: "Read requests"
    weight: 60
    flow:
      - post:
          url: "/api/third-party"
          beforeRequest: "setAuthHeaders"
          json:
            table: "requests"
            action: "read"
            filters:
              status: "open"

  - name: "Create found update"
    weight: 30
    flow:
      - post:
          url: "/api/third-party"
          beforeRequest: "setAuthHeaders"
          json:
            table: "found_updates"
            action: "create"
            patch:
              request_id: "{{ $randomUUID }}"
              message_from_found_party: "Load test message"

  - name: "Update request"
    weight: 10
    flow:
      - post:
          url: "/api/third-party"
          beforeRequest: "setAuthHeaders"
          json:
            table: "requests"
            action: "update"
            id: "{{ $randomUUID }}"
            patch:
              status: "closed"
```

### Load Test Processor

```javascript
// load-test-processor.js
const crypto = require('crypto');

module.exports = {
  setAuthHeaders: setAuthHeaders
};

function setAuthHeaders(requestParams, context, ee, next) {
  const token = process.env.HOPENET_STAGING_TOKEN;
  const payload = JSON.stringify(requestParams.json);
  
  const signature = crypto
    .createHmac('sha256', token)
    .update(payload)
    .digest('hex');

  requestParams.headers = {
    'Content-Type': 'application/json',
    'X-Signature': signature,
    'Idempotency-Key': `load-test-${Date.now()}-${Math.random()}`
  };

  return next();
}
```

## Monitoring and Health Checks

### Health Check Script

```javascript
// health-check.js
const HopeNetAPI = require('./src/hopenet-api');

class HealthChecker {
  constructor() {
    this.client = new HopeNetAPI(
      process.env.HOPENET_API_URL,
      process.env.HOPENET_API_TOKEN
    );
  }

  async checkHealth() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: {}
    };

    try {
      // Test basic read operation
      const startTime = Date.now();
      await this.client.makeRequest({
        table: 'requests',
        action: 'read',
        filters: { status: 'open' }
      });
      
      results.checks.read_operation = {
        status: 'pass',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      results.checks.read_operation = {
        status: 'fail',
        error: error.message
      };
      results.overall = 'unhealthy';
    }

    // Test authentication
    try {
      const badClient = new HopeNetAPI(
        process.env.HOPENET_API_URL,
        'invalid-token'
      );
      
      await badClient.makeRequest({
        table: 'requests',
        action: 'read'
      });

      // Should not reach here
      results.checks.authentication = {
        status: 'fail',
        error: 'Authentication should have failed'
      };
      results.overall = 'unhealthy';

    } catch (error) {
      if (error.message.includes('401')) {
        results.checks.authentication = {
          status: 'pass',
          message: 'Correctly rejected invalid token'
        };
      } else {
        results.checks.authentication = {
          status: 'fail',
          error: error.message
        };
        results.overall = 'unhealthy';
      }
    }

    return results;
  }
}

// Run health check
if (require.main === module) {
  const checker = new HealthChecker();
  checker.checkHealth()
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
      process.exit(results.overall === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}

module.exports = HealthChecker;
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/api-integration-test.yml
name: API Integration Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 */6 * * *'  # Run every 6 hours

jobs:
  integration-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm test
    
    - name: Run integration tests
      env:
        HOPENET_STAGING_TOKEN: ${{ secrets.HOPENET_STAGING_TOKEN }}
        TEST_REQUEST_ID: ${{ secrets.TEST_REQUEST_ID }}
      run: npm run test:integration
    
    - name: Run health check
      env:
        HOPENET_API_URL: https://staging.hopenet.example.com/api/third-party
        HOPENET_API_TOKEN: ${{ secrets.HOPENET_STAGING_TOKEN }}
      run: node health-check.js
    
    - name: Run load test (light)
      if: github.event_name == 'schedule'
      env:
        HOPENET_STAGING_TOKEN: ${{ secrets.HOPENET_STAGING_TOKEN }}
      run: npx artillery run load-test.yml
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest --testPathPattern=__tests__/.*\\.test\\.js$",
    "test:integration": "jest --testPathPattern=__tests__/integration\\.test\\.js$",
    "test:load": "artillery run load-test.yml",
    "health-check": "node health-check.js",
    "test:all": "npm test && npm run test:integration && npm run health-check"
  }
}
```

## Test Data Management

### Test Environment Setup

```javascript
// test-setup.js
const HopeNetAPI = require('./src/hopenet-api');

async function setupTestData() {
  const client = new HopeNetAPI(
    'https://staging.hopenet.example.com/api/third-party',
    process.env.HOPENET_STAGING_TOKEN
  );

  // Create test request (this would be done via the main app)
  console.log('Test data setup would happen here');
  console.log('Use TEST_REQUEST_ID environment variable for existing test data');
}

async function cleanupTestData() {
  // Cleanup logic here
  console.log('Test cleanup completed');
}

module.exports = { setupTestData, cleanupTestData };
```