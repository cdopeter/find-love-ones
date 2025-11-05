import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  checkIpAllowlist,
  extractClientIp,
  DEFAULT_RATE_LIMIT,
} from '../rateLimit';

describe('Rate Limit Utilities', () => {
  const testKey = 'test-api-key';

  beforeEach(() => {
    // Reset rate limit before each test
    resetRateLimit(testKey);
  });

  afterEach(() => {
    // Clean up after each test
    resetRateLimit(testKey);
  });

  describe('checkRateLimit', () => {
    it('allows requests when under limit', () => {
      const result = checkRateLimit(testKey);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeLessThan(DEFAULT_RATE_LIMIT.capacity);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('consumes tokens on each request', () => {
      const result1 = checkRateLimit(testKey);
      const result2 = checkRateLimit(testKey);

      expect(result2.remaining).toBeLessThan(result1.remaining);
    });

    it('blocks requests when limit exceeded', () => {
      // Consume all tokens
      for (let i = 0; i < DEFAULT_RATE_LIMIT.capacity; i++) {
        checkRateLimit(testKey);
      }

      // Next request should be blocked
      const result = checkRateLimit(testKey);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('respects custom rate limit config', () => {
      const customConfig = {
        capacity: 10,
        refillRate: 1,
        cost: 2,
      };

      const result = checkRateLimit(testKey, customConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(customConfig.capacity - customConfig.cost);
    });

    it('refills tokens over time', async () => {
      const config = {
        capacity: 10,
        refillRate: 10, // 10 tokens per second
        cost: 5,
      };

      // Consume 5 tokens
      checkRateLimit(testKey, config);

      // Wait 600ms (should refill ~6 tokens)
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Check status (should have ~11 tokens total, capped at 10)
      const status = getRateLimitStatus(testKey, config);
      expect(status.tokens).toBeGreaterThan(5);
    });

    it('maintains separate limits for different keys', () => {
      const key1 = 'key1';
      const key2 = 'key2';

      // Consume tokens from key1
      for (let i = 0; i < 50; i++) {
        checkRateLimit(key1);
      }

      // key2 should still have full capacity
      const result = checkRateLimit(key2);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(50);

      // Clean up
      resetRateLimit(key1);
      resetRateLimit(key2);
    });
  });

  describe('resetRateLimit', () => {
    it('resets rate limit for a key', () => {
      // Consume some tokens
      for (let i = 0; i < 30; i++) {
        checkRateLimit(testKey);
      }

      // Reset
      resetRateLimit(testKey);

      // Should have full capacity again
      const result = checkRateLimit(testKey);
      expect(result.remaining).toBe(DEFAULT_RATE_LIMIT.capacity - 1);
    });
  });

  describe('getRateLimitStatus', () => {
    it('returns current status without consuming tokens', () => {
      // Consume one token
      checkRateLimit(testKey);

      // Get status
      const status = getRateLimitStatus(testKey);

      // Get status again
      const status2 = getRateLimitStatus(testKey);

      // Status should be the same (no tokens consumed)
      expect(status.tokens).toBe(status2.tokens);
    });

    it('returns full capacity for new key', () => {
      const newKey = 'new-key';
      const status = getRateLimitStatus(newKey);

      expect(status.tokens).toBe(DEFAULT_RATE_LIMIT.capacity);
      expect(status.capacity).toBe(DEFAULT_RATE_LIMIT.capacity);
    });
  });

  describe('checkIpAllowlist', () => {
    it('allows all IPs when no allowlist configured', () => {
      expect(checkIpAllowlist('192.168.1.1')).toBe(true);
      expect(checkIpAllowlist('10.0.0.1')).toBe(true);
      expect(checkIpAllowlist('8.8.8.8')).toBe(true);
    });

    it('allows IPs in allowlist', () => {
      const allowlist = ['192.168.1.1', '10.0.0.1'];

      expect(checkIpAllowlist('192.168.1.1', allowlist)).toBe(true);
      expect(checkIpAllowlist('10.0.0.1', allowlist)).toBe(true);
    });

    it('blocks IPs not in allowlist', () => {
      const allowlist = ['192.168.1.1', '10.0.0.1'];

      expect(checkIpAllowlist('8.8.8.8', allowlist)).toBe(false);
      expect(checkIpAllowlist('172.16.0.1', allowlist)).toBe(false);
    });

    it('allows all when allowlist is empty array', () => {
      expect(checkIpAllowlist('192.168.1.1', [])).toBe(true);
    });
  });

  describe('extractClientIp', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const headers = new Headers({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('extracts IP from x-real-ip header', () => {
      const headers = new Headers({
        'x-real-ip': '192.168.1.1',
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('extracts IP from cf-connecting-ip header', () => {
      const headers = new Headers({
        'cf-connecting-ip': '192.168.1.1',
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('prefers x-forwarded-for over other headers', () => {
      const headers = new Headers({
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '10.0.0.1',
        'cf-connecting-ip': '172.16.0.1',
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('returns unknown when no IP headers present', () => {
      const headers = new Headers({});

      const ip = extractClientIp(headers);
      expect(ip).toBe('unknown');
    });

    it('handles x-forwarded-for with single IP', () => {
      const headers = new Headers({
        'x-forwarded-for': '192.168.1.1',
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe('192.168.1.1');
    });
  });
});
