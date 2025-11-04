/**
 * Idempotency utilities for third-party API
 * Prevents duplicate requests by tracking Idempotency-Key headers
 * In-memory implementation - consider Redis/Upstash for production with multiple instances
 */

interface IdempotencyRecord {
  key: string;
  table: string;
  id: string;
  hash: string;
  response: unknown;
  timestamp: number;
  expiresAt: number;
}

// In-memory store for idempotency keys
// Key: Idempotency-Key value, Value: Record
const idempotencyStore = new Map<string, IdempotencyRecord>();

// Default TTL: 24 hours
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

// Periodic cleanup of expired records
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (now > record.expiresAt) {
      idempotencyStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Generate hash of request payload for comparison
 */
function hashPayload(payload: string): string {
  // Simple hash function - in production, use crypto.createHash
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Check if request has already been processed
 * Returns cached response if found and matches payload
 */
export function checkIdempotency(
  idempotencyKey: string,
  table: string,
  id: string | undefined,
  payload: string
): { processed: boolean; response?: unknown; conflict?: boolean } {
  const record = idempotencyStore.get(idempotencyKey);

  if (!record) {
    return { processed: false };
  }

  // Check if record has expired
  const now = Date.now();
  if (now > record.expiresAt) {
    idempotencyStore.delete(idempotencyKey);
    return { processed: false };
  }

  // Check if payload matches (prevent key reuse with different data)
  const currentHash = hashPayload(payload);
  if (record.hash !== currentHash) {
    return {
      processed: true,
      conflict: true,
    };
  }

  // Check if table and id match
  if (record.table !== table || (id && record.id !== id)) {
    return {
      processed: true,
      conflict: true,
    };
  }

  // Return cached response
  return {
    processed: true,
    response: record.response,
  };
}

/**
 * Store response for idempotency key
 */
export function storeIdempotencyResponse(
  idempotencyKey: string,
  table: string,
  id: string,
  payload: string,
  response: unknown,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  const now = Date.now();
  const record: IdempotencyRecord = {
    key: idempotencyKey,
    table,
    id,
    hash: hashPayload(payload),
    response,
    timestamp: now,
    expiresAt: now + ttlMs,
  };

  idempotencyStore.set(idempotencyKey, record);
}

/**
 * Clear idempotency record (useful for testing)
 */
export function clearIdempotencyKey(idempotencyKey: string): void {
  idempotencyStore.delete(idempotencyKey);
}

/**
 * Validate idempotency key format
 * Should be a unique string, typically UUID or similar
 */
export function isValidIdempotencyKey(key: string): boolean {
  // Must be non-empty string, max 255 characters
  if (!key || typeof key !== 'string' || key.length > 255) {
    return false;
  }

  // Should contain only safe characters (alphanumeric, dashes, underscores)
  return /^[a-zA-Z0-9_-]+$/.test(key);
}

/**
 * Extract idempotency key from request headers
 */
export function extractIdempotencyKey(headers: Headers): string | null {
  return headers.get('idempotency-key') || headers.get('Idempotency-Key');
}
