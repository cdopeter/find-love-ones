import { describe, it, expect } from 'vitest';
import {
  generateHmacSignature,
  verifyHmacSignature,
  verifyHmacSignatureWithRotation,
  extractSignatureFromHeader,
  isValidSignatureFormat,
} from '../hmac';

describe('HMAC Utilities', () => {
  const testSecret = 'test-secret-key-12345';
  const testPayload = '{"table":"requests","action":"read"}';

  describe('generateHmacSignature', () => {
    it('generates a valid HMAC signature', () => {
      const signature = generateHmacSignature(testPayload, testSecret);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex string is 64 characters
    });

    it('generates consistent signatures for same input', () => {
      const sig1 = generateHmacSignature(testPayload, testSecret);
      const sig2 = generateHmacSignature(testPayload, testSecret);

      expect(sig1).toBe(sig2);
    });

    it('generates different signatures for different payloads', () => {
      const payload1 = '{"data":"test1"}';
      const payload2 = '{"data":"test2"}';

      const sig1 = generateHmacSignature(payload1, testSecret);
      const sig2 = generateHmacSignature(payload2, testSecret);

      expect(sig1).not.toBe(sig2);
    });

    it('generates different signatures for different secrets', () => {
      const secret1 = 'secret1';
      const secret2 = 'secret2';

      const sig1 = generateHmacSignature(testPayload, secret1);
      const sig2 = generateHmacSignature(testPayload, secret2);

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('verifyHmacSignature', () => {
    it('verifies a valid signature', () => {
      const signature = generateHmacSignature(testPayload, testSecret);
      const isValid = verifyHmacSignature(signature, testPayload, testSecret);

      expect(isValid).toBe(true);
    });

    it('rejects an invalid signature', () => {
      const invalidSignature = 'a'.repeat(64);
      const isValid = verifyHmacSignature(
        invalidSignature,
        testPayload,
        testSecret
      );

      expect(isValid).toBe(false);
    });

    it('rejects a signature with wrong secret', () => {
      const signature = generateHmacSignature(testPayload, testSecret);
      const isValid = verifyHmacSignature(
        signature,
        testPayload,
        'wrong-secret'
      );

      expect(isValid).toBe(false);
    });

    it('rejects a signature with modified payload', () => {
      const signature = generateHmacSignature(testPayload, testSecret);
      const modifiedPayload = '{"table":"requests","action":"update"}';
      const isValid = verifyHmacSignature(
        signature,
        modifiedPayload,
        testSecret
      );

      expect(isValid).toBe(false);
    });

    it('handles invalid signature format gracefully', () => {
      const isValid = verifyHmacSignature('invalid', testPayload, testSecret);

      expect(isValid).toBe(false);
    });
  });

  describe('verifyHmacSignatureWithRotation', () => {
    const activeKey = 'active-key-123';
    const nextKey = 'next-key-456';

    it('verifies signature with active key', () => {
      const signature = generateHmacSignature(testPayload, activeKey);
      const result = verifyHmacSignatureWithRotation(
        signature,
        testPayload,
        activeKey,
        nextKey
      );

      expect(result.valid).toBe(true);
      expect(result.keyUsed).toBe('active');
    });

    it('verifies signature with next key', () => {
      const signature = generateHmacSignature(testPayload, nextKey);
      const result = verifyHmacSignatureWithRotation(
        signature,
        testPayload,
        activeKey,
        nextKey
      );

      expect(result.valid).toBe(true);
      expect(result.keyUsed).toBe('next');
    });

    it('rejects invalid signature', () => {
      const invalidSignature = 'a'.repeat(64);
      const result = verifyHmacSignatureWithRotation(
        invalidSignature,
        testPayload,
        activeKey,
        nextKey
      );

      expect(result.valid).toBe(false);
      expect(result.keyUsed).toBeUndefined();
    });

    it('works without next key', () => {
      const signature = generateHmacSignature(testPayload, activeKey);
      const result = verifyHmacSignatureWithRotation(
        signature,
        testPayload,
        activeKey
      );

      expect(result.valid).toBe(true);
      expect(result.keyUsed).toBe('active');
    });
  });

  describe('extractSignatureFromHeader', () => {
    it('extracts signature without prefix', () => {
      const signature = 'a'.repeat(64);
      const extracted = extractSignatureFromHeader(signature);

      expect(extracted).toBe(signature);
    });

    it('extracts signature with sha256= prefix', () => {
      const signature = 'a'.repeat(64);
      const extracted = extractSignatureFromHeader(`sha256=${signature}`);

      expect(extracted).toBe(signature);
    });

    it('returns null for null header', () => {
      const extracted = extractSignatureFromHeader(null);

      expect(extracted).toBeNull();
    });
  });

  describe('isValidSignatureFormat', () => {
    it('validates correct signature format', () => {
      const validSignature = 'a'.repeat(64);

      expect(isValidSignatureFormat(validSignature)).toBe(true);
    });

    it('rejects too short signature', () => {
      const shortSignature = 'a'.repeat(32);

      expect(isValidSignatureFormat(shortSignature)).toBe(false);
    });

    it('rejects too long signature', () => {
      const longSignature = 'a'.repeat(128);

      expect(isValidSignatureFormat(longSignature)).toBe(false);
    });

    it('rejects non-hex characters', () => {
      const invalidSignature = 'g'.repeat(64);

      expect(isValidSignatureFormat(invalidSignature)).toBe(false);
    });

    it('accepts uppercase hex', () => {
      const validSignature = 'A'.repeat(64);

      expect(isValidSignatureFormat(validSignature)).toBe(true);
    });

    it('accepts mixed case hex', () => {
      const validSignature = 'aAbBcC' + 'd'.repeat(58);

      expect(isValidSignatureFormat(validSignature)).toBe(true);
    });
  });
});
