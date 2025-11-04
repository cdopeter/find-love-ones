import { createHmac, timingSafeEqual } from 'crypto';

/**
 * HMAC Authentication utilities for third-party API
 * Implements HMAC-SHA256 signature verification
 */

/**
 * Generate HMAC signature for a payload
 * @param payload - The request body as a string
 * @param secret - The secret key
 * @returns HMAC signature as hex string
 */
export function generateHmacSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verify HMAC signature using constant-time comparison
 * @param signature - The signature from the request header
 * @param payload - The request body as a string
 * @param secret - The secret key
 * @returns true if signature is valid
 */
export function verifyHmacSignature(signature: string, payload: string, secret: string): boolean {
  try {
    const expectedSignature = generateHmacSignature(payload, secret);

    // Convert to buffers for constant-time comparison
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    // Ensure both buffers are the same length
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error('Error verifying HMAC signature:', error);
    return false;
  }
}

/**
 * Verify HMAC signature with dual-key support (for key rotation)
 * Tries active key first, then falls back to next key
 * @param signature - The signature from the request header
 * @param payload - The request body as a string
 * @param activeKey - The active secret key
 * @param nextKey - The next secret key (optional, for rotation)
 * @returns Object with verification result and which key was used
 */
export function verifyHmacSignatureWithRotation(
  signature: string,
  payload: string,
  activeKey: string,
  nextKey?: string
): { valid: boolean; keyUsed?: 'active' | 'next' } {
  // Try active key first
  if (verifyHmacSignature(signature, payload, activeKey)) {
    return { valid: true, keyUsed: 'active' };
  }

  // Try next key if available
  if (nextKey && verifyHmacSignature(signature, payload, nextKey)) {
    return { valid: true, keyUsed: 'next' };
  }

  return { valid: false };
}

/**
 * Extract signature from X-Signature header
 * Supports formats:
 * - sha256=<signature>
 * - <signature>
 */
export function extractSignatureFromHeader(header: string | null): string | null {
  if (!header) return null;

  // Remove 'sha256=' prefix if present
  if (header.startsWith('sha256=')) {
    return header.substring(7);
  }

  return header;
}

/**
 * Validate signature header format
 */
export function isValidSignatureFormat(signature: string): boolean {
  // Should be a hex string of 64 characters (SHA256)
  return /^[a-f0-9]{64}$/i.test(signature);
}
