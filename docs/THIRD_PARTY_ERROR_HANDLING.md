# Third-Party API Error Handling Guide

## Common Error Scenarios and Solutions

### Authentication Errors (401 Unauthorized)

**Cause:** Invalid or missing HMAC signature

**Solutions:**
- Verify token is correct and not expired
- Ensure payload is signed exactly as sent (no whitespace differences)
- Check that signature is sent as lowercase hex string

```javascript
// ❌ Wrong - extra whitespace
const payload = JSON.stringify(data, null, 2);

// ✅ Correct - compact JSON
const payload = JSON.stringify(data);
```

### Rate Limiting (429 Too Many Requests)

**Cause:** Exceeded 60 requests per minute

**Solutions:**
- Implement exponential backoff
- Respect `Retry-After` header
- Cache responses when possible

```javascript
async function handleRateLimit(error) {
  if (error.status === 429) {
    const retryAfter = error.headers['retry-after'] || 60;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return { shouldRetry: true };
  }
  return { shouldRetry: false };
}
```

### Validation Errors (400 Bad Request)

**Common validation issues:**
- Invalid parish names (must be one of 14 Jamaican parishes)
- Invalid status values (must be 'open' or 'closed')
- Missing required fields
- Field length violations

```javascript
// ✅ Valid parish names
const validParishes = [
  'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 
  'St. Mary', 'St. Ann', 'Trelawny', 'St. James',
  'Hanover', 'Westmoreland', 'St. Elizabeth', 'Manchester',
  'Clarendon', 'St. Catherine'
];
```

### Idempotency Conflicts (409 Conflict)

**Cause:** Same idempotency key used with different data

**Solution:**
- Use unique keys for different operations
- Include request data hash in key generation

```javascript
function generateIdempotencyKey(operation, data) {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `${operation}-${hash}-${Date.now()}`;
}
```

## Error Response Handling

### Parse Error Details

```javascript
function parseAPIError(response) {
  const error = {
    status: response.status,
    type: response.data?.error || 'Unknown',
    message: response.data?.message || 'Unknown error',
    fields: response.data?.fields || [],
    retryable: false,
    retryAfter: null
  };
  
  // Determine if retryable
  if (response.status === 429) {
    error.retryable = true;
    error.retryAfter = response.headers['retry-after'];
  } else if (response.status >= 500) {
    error.retryable = true;
  }
  
  return error;
}
```

### Retry Logic Implementation

```javascript
class APIRetryHandler {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }
  
  async executeWithRetry(operation) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (!this.shouldRetry(error, attempt)) {
          throw error;
        }
        
        const delay = this.calculateDelay(attempt, error);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }
  
  shouldRetry(error, attempt) {
    if (attempt >= this.maxRetries) return false;
    
    // Always retry server errors
    if (error.status >= 500) return true;
    
    // Retry rate limits
    if (error.status === 429) return true;
    
    // Don't retry client errors
    if (error.status >= 400 && error.status < 500) return false;
    
    return true;
  }
  
  calculateDelay(attempt, error) {
    // Use Retry-After header if available
    if (error.status === 429 && error.retryAfter) {
      return error.retryAfter * 1000;
    }
    
    // Exponential backoff with jitter
    const backoff = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * backoff;
    return Math.min(backoff + jitter, 30000); // Max 30 seconds
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Monitoring and Alerting

### Error Tracking

```javascript
class APIMonitor {
  constructor() {
    this.errorCounts = new Map();
    this.lastErrors = [];
  }
  
  recordError(error, operation) {
    const key = `${operation}-${error.status}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    
    this.lastErrors.push({
      timestamp: new Date(),
      operation,
      status: error.status,
      message: error.message
    });
    
    // Keep only last 100 errors
    if (this.lastErrors.length > 100) {
      this.lastErrors.shift();
    }
    
    this.checkAlertConditions();
  }
  
  checkAlertConditions() {
    const recentErrors = this.lastErrors.filter(
      e => Date.now() - e.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (recentErrors.length > 10) {
      this.sendAlert('High error rate detected', recentErrors);
    }
    
    const authErrors = recentErrors.filter(e => e.status === 401);
    if (authErrors.length > 3) {
      this.sendAlert('Authentication failures detected', authErrors);
    }
  }
  
  sendAlert(message, errors) {
    console.error(`ALERT: ${message}`, errors);
    // Implement your alerting mechanism here
    // e.g., send to PagerDuty, Slack, email, etc.
  }
}
```

### Health Check Implementation

```javascript
async function performHealthCheck() {
  try {
    const startTime = Date.now();
    
    // Simple read operation as health check
    await client.makeRequest({
      table: 'requests',
      action: 'read',
      filters: { status: 'open' }
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Run health check every 5 minutes
setInterval(async () => {
  const health = await performHealthCheck();
  console.log('Health check:', health);
  
  if (health.status === 'unhealthy') {
    // Alert on health check failure
    console.error('API health check failed:', health.error);
  }
}, 5 * 60 * 1000);
```

## Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(failureThreshold = 5, resetTimeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage
const circuitBreaker = new CircuitBreaker();

async function makeAPICall(data) {
  return circuitBreaker.execute(() => client.makeRequest(data));
}
```

## Error Logging Best Practices

### Structured Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

function logAPIError(error, operation, requestData) {
  logger.error('API_REQUEST_FAILED', {
    operation,
    status: error.status,
    message: error.message,
    requestId: requestData.idempotencyKey,
    table: requestData.table,
    action: requestData.action,
    timestamp: new Date().toISOString(),
    stack: error.stack
  });
}
```

### Sensitive Data Filtering

```javascript
function sanitizeForLogging(data) {
  const sanitized = { ...data };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'requester_email', 'requester_phone', 
    'requester_first_name', 'requester_last_name'
  ];
  
  sensitiveFields.forEach(field => {
    if (sanitized.patch && sanitized.patch[field]) {
      sanitized.patch[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}
```