import { describe, it, expect } from 'vitest';
import {
  validateThirdPartyRequest,
  ThirdPartyApiRequestSchema,
  RequestsUpdateSchema,
  FoundUpdatesCreateSchema,
  FoundUpdatesUpdateSchema,
} from '../validations/thirdPartyApi';

describe('Third Party API Validation Schemas', () => {
  describe('ThirdPartyApiRequestSchema', () => {
    it('validates a valid create request', () => {
      const data = {
        table: 'found_updates',
        action: 'create',
        patch: {
          request_id: '550e8400-e29b-41d4-a716-446655440000',
          message_from_found_party: 'Person found safe',
        },
      };

      const result = ThirdPartyApiRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates a valid update request', () => {
      const data = {
        table: 'requests',
        action: 'update',
        id: '550e8400-e29b-41d4-a716-446655440000',
        patch: {
          status: 'closed',
        },
      };

      const result = ThirdPartyApiRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates a valid read request', () => {
      const data = {
        table: 'requests',
        action: 'read',
        filters: {
          parish: 'Kingston',
        },
      };

      const result = ThirdPartyApiRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects invalid table name', () => {
      const data = {
        table: 'invalid_table',
        action: 'read',
      };

      const result = ThirdPartyApiRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid action', () => {
      const data = {
        table: 'requests',
        action: 'delete',
      };

      const result = ThirdPartyApiRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID format for id', () => {
      const data = {
        table: 'requests',
        action: 'update',
        id: 'not-a-uuid',
        patch: { status: 'closed' },
      };

      const result = ThirdPartyApiRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('RequestsUpdateSchema', () => {
    it('validates valid update data', () => {
      const data = {
        target_first_name: 'John',
        target_last_name: 'Doe',
        status: 'closed',
        parish: 'Kingston',
      };

      const result = RequestsUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates with nullable fields', () => {
      const data = {
        lat: null,
        lng: null,
        message_to_person: null,
      };

      const result = RequestsUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates lat/lng range', () => {
      const validData = {
        lat: 18.0179,
        lng: -76.8099,
      };

      const result = RequestsUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid lat value', () => {
      const data = {
        lat: 100, // > 90
      };

      const result = RequestsUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid lng value', () => {
      const data = {
        lng: -200, // < -180
      };

      const result = RequestsUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid status value', () => {
      const data = {
        status: 'invalid',
      };

      const result = RequestsUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid parish', () => {
      const data = {
        parish: 'Invalid Parish',
      };

      const result = RequestsUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('allows valid parish', () => {
      const data = {
        parish: 'St. Andrew',
      };

      const result = RequestsUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects too long strings', () => {
      const data = {
        target_first_name: 'A'.repeat(101), // max is 100
      };

      const result = RequestsUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects empty strings for name fields', () => {
      const data = {
        target_first_name: '',
      };

      const result = RequestsUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('FoundUpdatesCreateSchema', () => {
    it('validates valid create data', () => {
      const data = {
        request_id: '550e8400-e29b-41d4-a716-446655440000',
        message_from_found_party: 'Person has been found safe',
      };

      const result = FoundUpdatesCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates with optional created_by', () => {
      const data = {
        request_id: '550e8400-e29b-41d4-a716-446655440000',
        message_from_found_party: 'Person has been found safe',
        created_by: 'external_app_v1',
      };

      const result = FoundUpdatesCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects invalid request_id UUID', () => {
      const data = {
        request_id: 'not-a-uuid',
        message_from_found_party: 'Message',
      };

      const result = FoundUpdatesCreateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects empty message', () => {
      const data = {
        request_id: '550e8400-e29b-41d4-a716-446655440000',
        message_from_found_party: '',
      };

      const result = FoundUpdatesCreateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects message that is too long', () => {
      const data = {
        request_id: '550e8400-e29b-41d4-a716-446655440000',
        message_from_found_party: 'A'.repeat(5001),
      };

      const result = FoundUpdatesCreateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts message at maximum length', () => {
      const data = {
        request_id: '550e8400-e29b-41d4-a716-446655440000',
        message_from_found_party: 'A'.repeat(5000),
      };

      const result = FoundUpdatesCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('allows valid created_by', () => {
      const data = {
        request_id: '550e8400-e29b-41d4-a716-446655440000',
        message_from_found_party: 'Person found safe',
        created_by: 'A'.repeat(255),
      };

      const result = FoundUpdatesCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('FoundUpdatesUpdateSchema', () => {
    it('validates valid update data', () => {
      const data = {
        message_from_found_party: 'Updated message',
      };

      const result = FoundUpdatesUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects empty message', () => {
      const data = {
        message_from_found_party: '',
      };

      const result = FoundUpdatesUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('validates message length', () => {
      const data = {
        message_from_found_party: 'Updated message with valid length',
      };

      const result = FoundUpdatesUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('validateThirdPartyRequest', () => {
    it('validates a complete create request', () => {
      const body = {
        table: 'found_updates',
        action: 'create',
        patch: {
          request_id: '550e8400-e29b-41d4-a716-446655440000',
          message_from_found_party: 'Person found safe',
        },
      };

      const result = validateThirdPartyRequest(body);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(body);
    });

    it('validates a complete update request', () => {
      const body = {
        table: 'requests',
        action: 'update',
        id: '550e8400-e29b-41d4-a716-446655440000',
        patch: {
          status: 'closed',
        },
      };

      const result = validateThirdPartyRequest(body);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(body);
    });

    it('rejects update without id', () => {
      const body = {
        table: 'requests',
        action: 'update',
        patch: {
          status: 'closed',
        },
      };

      const result = validateThirdPartyRequest(body);

      expect(result.success).toBe(false);
      expect(result.error).toContain('ID is required');
    });

    it('rejects create without patch', () => {
      const body = {
        table: 'found_updates',
        action: 'create',
      };

      const result = validateThirdPartyRequest(body);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Patch data is required');
    });

    it('validates basic request structure for requests update', () => {
      const body = {
        table: 'requests',
        action: 'update',
        id: '550e8400-e29b-41d4-a716-446655440000',
        patch: {
          status: 'closed', // Valid status
        },
      };

      const result = validateThirdPartyRequest(body);

      // Should pass basic validation, field-level validation happens in allowlist
      expect(result.success).toBe(true);
    });

    it('validates basic request structure for found_updates create', () => {
      const body = {
        table: 'found_updates',
        action: 'create',
        patch: {
          request_id: '550e8400-e29b-41d4-a716-446655440000',
          message_from_found_party: 'Message',
        },
      };

      const result = validateThirdPartyRequest(body);

      // Should pass basic validation, field-level validation happens in allowlist
      expect(result.success).toBe(true);
    });

    it('accepts read request without patch', () => {
      const body = {
        table: 'requests',
        action: 'read',
        filters: {
          parish: 'Kingston',
        },
      };

      const result = validateThirdPartyRequest(body);

      expect(result.success).toBe(true);
    });
  });
});
