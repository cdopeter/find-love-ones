# Third-Party API Code Examples

## Node.js Examples

### Basic Setup

```javascript
const crypto = require('crypto');
const fetch = require('node-fetch');

class HopeNetAPI {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  generateSignature(payload) {
    return crypto
      .createHmac('sha256', this.token)
      .update(payload)
      .digest('hex');
  }

  async makeRequest(data, idempotencyKey = null) {
    const payload = JSON.stringify(data);
    const signature = this.generateSignature(payload);
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Signature': signature,
    };
    
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: payload,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message}`);
    }

    return response.json();
  }
}

// Initialize client
const client = new HopeNetAPI(
  'https://staging.hopenet.example.com/api/third-party',
  process.env.HOPENET_API_TOKEN
);
```

### Example 1: Create Found Update

```javascript
async function createFoundUpdate() {
  try {
    const result = await client.makeRequest({
      table: 'found_updates',
      action: 'create',
      patch: {
        request_id: '550e8400-e29b-41d4-a716-446655440000',
        message_from_found_party: 'Person has been found safe and is being reunited with family.',
        created_by: 'emergency_services_app'
      }
    }, `found-update-${Date.now()}`);
    
    console.log('Found update created:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to create found update:', error.message);
    throw error;
  }
}
```

### Example 2: Update Request Status

```javascript
async function updateRequestStatus(requestId, status) {
  try {
    const result = await client.makeRequest({
      table: 'requests',
      action: 'update',
      id: requestId,
      patch: { status }
    }, `status-update-${requestId}-${Date.now()}`);
    
    console.log('Request status updated:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to update request status:', error.message);
    throw error;
  }
}

// Usage
updateRequestStatus('550e8400-e29b-41d4-a716-446655440000', 'closed');
```

### Example 3: Search Open Requests

```javascript
async function getOpenRequests(parish = null) {
  try {
    const filters = { status: 'open' };
    if (parish) {
      filters.parish = parish;
    }

    const result = await client.makeRequest({
      table: 'requests',
      action: 'read',
      filters
    });
    
    console.log(`Found ${result.data.length} open requests`);
    return result.data;
  } catch (error) {
    console.error('Failed to fetch open requests:', error.message);
    throw error;
  }
}

// Usage
getOpenRequests('Kingston');
```

---

## Python Examples

### Basic Setup

```python
import hmac
import hashlib
import json
import requests
import time
from typing import Dict, Any, Optional

class HopeNetAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token.encode('utf-8')
    
    def generate_signature(self, payload: str) -> str:
        return hmac.new(
            self.token,
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
    
    def make_request(self, data: Dict[str, Any], idempotency_key: Optional[str] = None) -> Dict[str, Any]:
        payload = json.dumps(data, separators=(',', ':'))
        signature = self.generate_signature(payload)
        
        headers = {
            'Content-Type': 'application/json',
            'X-Signature': signature,
        }
        
        if idempotency_key:
            headers['Idempotency-Key'] = idempotency_key
        
        response = requests.post(
            self.base_url,
            headers=headers,
            data=payload,
            timeout=30
        )
        
        if not response.ok:
            error_data = response.json()
            raise Exception(f"API Error: {error_data.get('message', 'Unknown error')}")
        
        return response.json()

# Initialize client
client = HopeNetAPI(
    'https://staging.hopenet.example.com/api/third-party',
    os.environ['HOPENET_API_TOKEN']
)
```

### Example 1: Create Found Update with Retry Logic

```python
import time
import random

def create_found_update_with_retry(request_id: str, message: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            result = client.make_request({
                'table': 'found_updates',
                'action': 'create',
                'patch': {
                    'request_id': request_id,
                    'message_from_found_party': message,
                    'created_by': 'rescue_coordination_center'
                }
            }, f'found-update-{request_id}-{int(time.time())}')
            
            print(f'Found update created: {result["data"]["id"]}')
            return result['data']
            
        except Exception as e:
            if '429' in str(e):  # Rate limit
                wait_time = (2 ** attempt) + random.uniform(0, 1)
                print(f'Rate limited, waiting {wait_time:.2f}s before retry {attempt + 1}')
                time.sleep(wait_time)
            elif attempt == max_retries - 1:
                raise e
            else:
                print(f'Attempt {attempt + 1} failed: {e}')
                time.sleep(1)
    
    raise Exception('Max retries exceeded')
```

### Example 2: Bulk Operations

```python
def process_found_updates_batch(updates: List[Dict[str, str]]):
    results = []
    errors = []
    
    for update in updates:
        try:
            result = client.make_request({
                'table': 'found_updates',
                'action': 'create',
                'patch': update
            }, f'batch-update-{update["request_id"]}-{int(time.time())}')
            
            results.append(result['data'])
            
        except Exception as e:
            errors.append({
                'request_id': update['request_id'],
                'error': str(e)
            })
            
        # Rate limit protection
        time.sleep(1)  # 1 second between requests
    
    return {
        'successful': results,
        'failed': errors,
        'total_processed': len(updates)
    }
```

---

## PHP Examples

### Basic Setup

```php
<?php

class HopeNetAPI 
{
    private $baseUrl;
    private $token;
    
    public function __construct($baseUrl, $token) 
    {
        $this->baseUrl = $baseUrl;
        $this->token = $token;
    }
    
    private function generateSignature($payload) 
    {
        return hash_hmac('sha256', $payload, $this->token);
    }
    
    public function makeRequest($data, $idempotencyKey = null) 
    {
        $payload = json_encode($data, JSON_UNESCAPED_SLASHES);
        $signature = $this->generateSignature($payload);
        
        $headers = [
            'Content-Type: application/json',
            'X-Signature: ' . $signature,
        ];
        
        if ($idempotencyKey) {
            $headers[] = 'Idempotency-Key: ' . $idempotencyKey;
        }
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->baseUrl,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            $error = json_decode($response, true);
            throw new Exception('API Error: ' . ($error['message'] ?? 'Unknown error'));
        }
        
        return json_decode($response, true);
    }
}

// Initialize client
$client = new HopeNetAPI(
    'https://staging.hopenet.example.com/api/third-party',
    $_ENV['HOPENET_API_TOKEN']
);
```

### Example: Create Found Update

```php
<?php

function createFoundUpdate($requestId, $message) 
{
    global $client;
    
    try {
        $result = $client->makeRequest([
            'table' => 'found_updates',
            'action' => 'create',
            'patch' => [
                'request_id' => $requestId,
                'message_from_found_party' => $message,
                'created_by' => 'police_department_system'
            ]
        ], 'found-update-' . $requestId . '-' . time());
        
        echo "Found update created: " . $result['data']['id'] . "\n";
        return $result['data'];
        
    } catch (Exception $e) {
        echo "Failed to create found update: " . $e->getMessage() . "\n";
        throw $e;
    }
}
```

---

## Error Handling Best Practices

### Rate Limit Handling

```javascript
async function makeRequestWithBackoff(client, data, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.makeRequest(data);
    } catch (error) {
      if (error.message.includes('429') && attempt < maxRetries - 1) {
        const backoffTime = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`Rate limited, backing off for ${backoffTime}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      throw error;
    }
  }
}
```

### Comprehensive Error Handler

```javascript
function handleAPIError(error, operation) {
  console.error(`Operation ${operation} failed:`, error.message);
  
  // Log for monitoring
  logger.error('API_ERROR', {
    operation,
    error: error.message,
    timestamp: new Date().toISOString()
  });
  
  // Different handling based on error type
  if (error.message.includes('429')) {
    // Rate limit - implement backoff
    return { retry: true, backoff: true };
  } else if (error.message.includes('401')) {
    // Auth error - check token
    return { retry: false, checkAuth: true };
  } else if (error.message.includes('404')) {
    // Not found - data issue
    return { retry: false, dataError: true };
  } else {
    // Other errors - log and alert
    return { retry: true, alert: true };
  }
}
```

---

## Testing Examples

### Unit Tests (Jest)

```javascript
describe('HopeNetAPI', () => {
  let client;
  
  beforeEach(() => {
    client = new HopeNetAPI('https://test.example.com', 'test-token');
  });
  
  test('generates correct signature', () => {
    const payload = '{"test":"data"}';
    const signature = client.generateSignature(payload);
    expect(signature).toMatch(/^[a-f0-9]{64}$/);
  });
  
  test('handles rate limit errors', async () => {
    // Mock rate limit response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: 'Rate limit exceeded' })
    });
    
    await expect(client.makeRequest({ test: 'data' }))
      .rejects.toThrow('Rate limit exceeded');
  });
});
```

### Integration Tests

```javascript
describe('Integration Tests', () => {
  test('can create and read found update', async () => {
    // Create
    const createResult = await client.makeRequest({
      table: 'found_updates',
      action: 'create',
      patch: {
        request_id: TEST_REQUEST_ID,
        message_from_found_party: 'Test message'
      }
    }, `test-${Date.now()}`);
    
    expect(createResult.success).toBe(true);
    expect(createResult.data.id).toBeDefined();
    
    // Read back
    const readResult = await client.makeRequest({
      table: 'found_updates',
      action: 'read',
      id: createResult.data.id
    });
    
    expect(readResult.data.message_from_found_party).toBe('Test message');
  });
});
```