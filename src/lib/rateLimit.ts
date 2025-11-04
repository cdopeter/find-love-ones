/**
 * Rate Limiting utilities using Token Bucket algorithm
 * In-memory implementation - consider Redis/Upstash for production with multiple instances
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number; // tokens per second
}

// In-memory store for rate limiting
// Key: API key or identifier, Value: Token bucket
const rateLimitStore = new Map<string, TokenBucket>();

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_IDLE_TIME = 60 * 60 * 1000; // 1 hour

// Periodic cleanup of idle buckets
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now - bucket.lastRefill > MAX_IDLE_TIME) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  capacity: number; // Maximum tokens
  refillRate: number; // Tokens added per second
  cost?: number; // Cost per request (default: 1)
}

/**
 * Default rate limit: 60 requests per minute
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  capacity: 60,
  refillRate: 1, // 1 token per second = 60 per minute
  cost: 1,
};

/**
 * Check if request is allowed and consume tokens
 * @param key - Unique identifier for the rate limit bucket (e.g., API key)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and retry information
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const cost = config.cost ?? 1;

  // Get or create bucket
  let bucket = rateLimitStore.get(key);
  if (!bucket) {
    bucket = {
      tokens: config.capacity,
      lastRefill: now,
      capacity: config.capacity,
      refillRate: config.refillRate,
    };
    rateLimitStore.set(key, bucket);
  }

  // Calculate tokens to add based on time elapsed
  const elapsedSeconds = (now - bucket.lastRefill) / 1000;
  const tokensToAdd = elapsedSeconds * bucket.refillRate;

  // Refill tokens (up to capacity)
  bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  // Check if we have enough tokens
  if (bucket.tokens >= cost) {
    // Consume tokens
    bucket.tokens -= cost;

    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetAt: now + ((bucket.capacity - bucket.tokens) / bucket.refillRate) * 1000,
    };
  } else {
    // Not enough tokens - calculate retry time
    const tokensNeeded = cost - bucket.tokens;
    const retryAfterSeconds = Math.ceil(tokensNeeded / bucket.refillRate);

    return {
      allowed: false,
      remaining: 0,
      resetAt: now + ((bucket.capacity - bucket.tokens) / bucket.refillRate) * 1000,
      retryAfter: retryAfterSeconds,
    };
  }
}

/**
 * Reset rate limit for a key (useful for testing)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without consuming tokens
 */
export function getRateLimitStatus(
  key: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): {
  tokens: number;
  capacity: number;
  resetAt: number;
} {
  const bucket = rateLimitStore.get(key);
  const now = Date.now();

  if (!bucket) {
    return {
      tokens: config.capacity,
      capacity: config.capacity,
      resetAt: now,
    };
  }

  // Calculate current tokens without modifying the bucket
  const elapsedSeconds = (now - bucket.lastRefill) / 1000;
  const tokensToAdd = elapsedSeconds * bucket.refillRate;
  const currentTokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);

  return {
    tokens: Math.floor(currentTokens),
    capacity: bucket.capacity,
    resetAt: now + ((bucket.capacity - currentTokens) / bucket.refillRate) * 1000,
  };
}

/**
 * Optional: IP allowlist check
 * Returns true if IP is in allowlist or if no allowlist is configured
 */
export function checkIpAllowlist(ip: string, allowlist?: string[]): boolean {
  // If no allowlist configured, allow all IPs
  if (!allowlist || allowlist.length === 0) {
    return true;
  }

  // Check if IP is in allowlist
  return allowlist.includes(ip);
}

/**
 * Extract client IP from request headers
 * Handles various proxy headers
 */
export function extractClientIp(headers: Headers): string {
  // Check common headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to unknown
  return 'unknown';
}
