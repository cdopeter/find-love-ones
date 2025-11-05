import { describe, it, expect } from 'vitest';
import {
  isTableAllowed,
  isFieldAllowed,
  isFieldReadOnly,
  validateFieldValue,
  filterPatch,
  validateRequiredFields,
} from '../thirdPartyAllowlist';

describe('Third Party Allowlist', () => {
  describe('isTableAllowed', () => {
    it('allows requests table', () => {
      expect(isTableAllowed('requests')).toBe(true);
    });

    it('allows found_updates table', () => {
      expect(isTableAllowed('found_updates')).toBe(true);
    });

    it('rejects unknown tables', () => {
      expect(isTableAllowed('users')).toBe(false);
      expect(isTableAllowed('profiles')).toBe(false);
      expect(isTableAllowed('random_table')).toBe(false);
    });
  });

  describe('isFieldAllowed - requests table', () => {
    it('allows permitted fields', () => {
      expect(isFieldAllowed('requests', 'id')).toBe(true);
      expect(isFieldAllowed('requests', 'target_first_name')).toBe(true);
      expect(isFieldAllowed('requests', 'target_last_name')).toBe(true);
      expect(isFieldAllowed('requests', 'age')).toBe(true);
      expect(isFieldAllowed('requests', 'gender')).toBe(true);
      expect(isFieldAllowed('requests', 'nickname')).toBe(true);
      expect(isFieldAllowed('requests', 'parish')).toBe(true);
      expect(isFieldAllowed('requests', 'status')).toBe(true);
    });

    it('rejects restricted fields', () => {
      expect(isFieldAllowed('requests', 'requester_email')).toBe(false);
      expect(isFieldAllowed('requests', 'requester_phone')).toBe(false);
    });

    it('rejects unknown fields', () => {
      expect(isFieldAllowed('requests', 'unknown_field')).toBe(false);
    });
  });

  describe('isFieldAllowed - found_updates table', () => {
    it('allows all defined fields', () => {
      expect(isFieldAllowed('found_updates', 'id')).toBe(true);
      expect(isFieldAllowed('found_updates', 'request_id')).toBe(true);
      expect(isFieldAllowed('found_updates', 'message_from_found_party')).toBe(
        true
      );
      expect(isFieldAllowed('found_updates', 'created_by')).toBe(true);
    });

    it('rejects unknown fields', () => {
      expect(isFieldAllowed('found_updates', 'unknown_field')).toBe(false);
    });
  });

  describe('isFieldReadOnly', () => {
    it('marks id as read-only for requests', () => {
      expect(isFieldReadOnly('requests', 'id')).toBe(true);
    });

    it('marks created_at as read-only for requests', () => {
      expect(isFieldReadOnly('requests', 'created_at')).toBe(true);
    });

    it('marks email_sent_at as read-only for requests', () => {
      expect(isFieldReadOnly('requests', 'email_sent_at')).toBe(true);
    });

    it('allows modification of target_first_name', () => {
      expect(isFieldReadOnly('requests', 'target_first_name')).toBe(false);
    });

    it('marks id as read-only for found_updates', () => {
      expect(isFieldReadOnly('found_updates', 'id')).toBe(true);
    });

    it('allows modification of message_from_found_party', () => {
      expect(isFieldReadOnly('found_updates', 'message_from_found_party')).toBe(
        false
      );
    });
  });

  describe('validateFieldValue', () => {
    describe('requests table', () => {
      it('validates status field', () => {
        expect(validateFieldValue('requests', 'status', 'open')).toBe(true);
        expect(validateFieldValue('requests', 'status', 'closed')).toBe(true);
        expect(validateFieldValue('requests', 'status', 'invalid')).toBe(false);
        expect(validateFieldValue('requests', 'status', 123)).toBe(false);
      });

      it('validates parish field', () => {
        expect(validateFieldValue('requests', 'parish', 'Kingston')).toBe(true);
        expect(validateFieldValue('requests', 'parish', 'St. Andrew')).toBe(
          true
        );
        expect(validateFieldValue('requests', 'parish', 'Invalid Parish')).toBe(
          false
        );
        expect(validateFieldValue('requests', 'parish', 123)).toBe(false);
      });

      it('accepts any value for fields without validators', () => {
        expect(
          validateFieldValue('requests', 'target_first_name', 'John')
        ).toBe(true);
        expect(validateFieldValue('requests', 'target_last_name', 'Doe')).toBe(
          true
        );
      });
    });

    describe('found_updates table', () => {
      it('validates message_from_found_party length', () => {
        expect(
          validateFieldValue(
            'found_updates',
            'message_from_found_party',
            'Valid message'
          )
        ).toBe(true);
        expect(
          validateFieldValue(
            'found_updates',
            'message_from_found_party',
            'A'.repeat(5000)
          )
        ).toBe(true);
        expect(
          validateFieldValue('found_updates', 'message_from_found_party', '')
        ).toBe(false);
        expect(
          validateFieldValue(
            'found_updates',
            'message_from_found_party',
            'A'.repeat(5001)
          )
        ).toBe(false);
        expect(
          validateFieldValue('found_updates', 'message_from_found_party', 123)
        ).toBe(false);
      });
    });
  });

  describe('filterPatch', () => {
    describe('requests table', () => {
      it('allows valid fields', () => {
        const patch = {
          target_first_name: 'John',
          target_last_name: 'Doe',
          age: 30,
          gender: 'Male',
          nickname: 'Johnny',
          status: 'closed',
        };

        const result = filterPatch('requests', patch);

        expect(result.allowed).toEqual(patch);
        expect(result.rejected).toEqual([]);
      });

      it('rejects read-only fields', () => {
        const patch = {
          id: 'new-id',
          created_at: '2025-01-01',
          target_first_name: 'John',
        };

        const result = filterPatch('requests', patch);

        expect(result.allowed).toEqual({ target_first_name: 'John' });
        expect(result.rejected).toContain('id');
        expect(result.rejected).toContain('created_at');
      });

      it('rejects restricted fields', () => {
        const patch = {
          requester_email: 'test@example.com',
          requester_phone: '123-456-7890',
          target_first_name: 'John',
        };

        const result = filterPatch('requests', patch);

        expect(result.allowed).toEqual({ target_first_name: 'John' });
        expect(result.rejected).toContain('requester_email');
        expect(result.rejected).toContain('requester_phone');
      });

      it('rejects fields that fail validation', () => {
        const patch = {
          status: 'invalid_status',
          parish: 'Invalid Parish',
          target_first_name: 'John',
        };

        const result = filterPatch('requests', patch);

        expect(result.allowed).toEqual({ target_first_name: 'John' });
        expect(result.rejected).toContain('status');
        expect(result.rejected).toContain('parish');
      });

      it('handles mixed valid and invalid fields', () => {
        const patch = {
          target_first_name: 'John',
          target_last_name: 'Doe',
          age: 25,
          gender: 'Female',
          nickname: 'JD',
          status: 'open',
          parish: 'Kingston',
          requester_email: 'blocked@example.com',
          id: 'read-only-id',
          unknown_field: 'value',
        };

        const result = filterPatch('requests', patch);

        expect(result.allowed).toEqual({
          target_first_name: 'John',
          target_last_name: 'Doe',
          age: 25,
          gender: 'Female',
          nickname: 'JD',
          status: 'open',
          parish: 'Kingston',
        });
        expect(result.rejected).toContain('requester_email');
        expect(result.rejected).toContain('id');
        expect(result.rejected).toContain('unknown_field');
      });
    });

    describe('found_updates table', () => {
      it('allows valid fields', () => {
        const patch = {
          request_id: 'uuid-123',
          message_from_found_party: 'Person found safe',
          created_by: 'external_app',
        };

        const result = filterPatch('found_updates', patch);

        expect(result.allowed).toEqual(patch);
        expect(result.rejected).toEqual([]);
      });

      it('rejects read-only fields', () => {
        const patch = {
          id: 'new-id',
          created_at: '2025-01-01',
          message_from_found_party: 'Valid message',
        };

        const result = filterPatch('found_updates', patch);

        expect(result.allowed).toEqual({
          message_from_found_party: 'Valid message',
        });
        expect(result.rejected).toContain('id');
        expect(result.rejected).toContain('created_at');
      });

      it('rejects invalid message length', () => {
        const patch = {
          message_from_found_party: '', // Too short
          request_id: 'uuid-123',
        };

        const result = filterPatch('found_updates', patch);

        expect(result.allowed).toEqual({ request_id: 'uuid-123' });
        expect(result.rejected).toContain('message_from_found_party');
      });
    });

    describe('unknown table', () => {
      it('rejects all fields for unknown table', () => {
        const patch = {
          field1: 'value1',
          field2: 'value2',
        };

        const result = filterPatch('unknown_table', patch);

        expect(result.allowed).toEqual({});
        expect(result.rejected).toEqual(['field1', 'field2']);
      });
    });
  });

  describe('validateRequiredFields', () => {
    describe('found_updates table', () => {
      it('returns empty array when all required fields present', () => {
        const patch = {
          request_id: 'uuid-123',
          message_from_found_party: 'Valid message',
        };

        const missing = validateRequiredFields('found_updates', patch);
        expect(missing).toEqual([]);
      });

      it('returns missing required fields', () => {
        const patch = {
          message_from_found_party: 'Valid message',
          // missing request_id
        };

        const missing = validateRequiredFields('found_updates', patch);
        expect(missing).toContain('request_id');
      });

      it('detects null values as missing', () => {
        const patch = {
          request_id: null,
          message_from_found_party: 'Valid message',
        };

        const missing = validateRequiredFields('found_updates', patch);
        expect(missing).toContain('request_id');
      });

      it('detects undefined values as missing', () => {
        const patch = {
          request_id: undefined,
          message_from_found_party: 'Valid message',
        };

        const missing = validateRequiredFields('found_updates', patch);
        expect(missing).toContain('request_id');
      });
    });

    describe('requests table', () => {
      it('returns empty array as requests has no required fields for updates', () => {
        const patch = {};

        const missing = validateRequiredFields('requests', patch);
        expect(missing).toEqual([]);
      });
    });
  });
});
