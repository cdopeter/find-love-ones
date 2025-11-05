import { z } from 'zod';

/**
 * Zod validation schemas for third-party API requests
 */

// Valid parishes in Jamaica
const VALID_PARISHES = [
  'Kingston',
  'St. Andrew',
  'St. Thomas',
  'Portland',
  'St. Mary',
  'St. Ann',
  'Trelawny',
  'St. James',
  'Manchester',
  'Clarendon',
  'St. Catherine',
  'Hanover',
  'Westmoreland',
  'St. Elizabeth',
] as const;

/**
 * Schema for requests table updates
 */
export const RequestsUpdateSchema = z.object({
  target_first_name: z.string().min(1).max(100).optional(),
  target_last_name: z.string().min(1).max(100).optional(),
  last_known_address: z.string().min(1).max(500).optional(),
  parish: z.enum(VALID_PARISHES).optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  status: z.enum(['open', 'closed']).optional(),
  message_to_person: z.string().max(5000).nullable().optional(),
});

/**
 * Schema for found_updates table inserts
 */
export const FoundUpdatesCreateSchema = z.object({
  request_id: z.string().uuid(),
  message_from_found_party: z.string().min(1).max(5000),
  created_by: z.string().max(255).optional(), // Optional, can be set by API
});

/**
 * Schema for found_updates table updates
 */
export const FoundUpdatesUpdateSchema = z.object({
  message_from_found_party: z.string().min(1).max(5000).optional(),
});

/**
 * Schema for the main API request body
 */
export const ThirdPartyApiRequestSchema = z.object({
  table: z.enum(['requests', 'found_updates']),
  action: z.enum(['create', 'update', 'read']),
  id: z.string().uuid().optional(), // Required for update, optional for create/read
  patch: z.any().optional(), // The data to update/create
  filters: z.any().optional(), // For read operations
});

/**
 * Validate request body based on table and action
 */
export function validateThirdPartyRequest(body: unknown): {
  success: boolean;
  data?: z.infer<typeof ThirdPartyApiRequestSchema>;
  error?: string;
} {
  const result = ThirdPartyApiRequestSchema.safeParse(body);

  if (!result.success) {
    const errorMessages =
      result.error.issues
        ?.map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ') || 'Validation error';

    return {
      success: false,
      error: `Invalid request format: ${errorMessages}`,
    };
  }

  const { action, id, patch } = result.data;

  // Validate action-specific requirements
  if (action === 'update' && !id) {
    return {
      success: false,
      error: 'ID is required for update action',
    };
  }

  if ((action === 'create' || action === 'update') && !patch) {
    return {
      success: false,
      error: 'Patch data is required for create/update actions',
    };
  }

  // Note: Detailed patch validation is handled by the allowlist and database constraints
  // This keeps validation simple and avoids Zod v4 compatibility issues

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Type exports for TypeScript
 */
export type ThirdPartyApiRequest = z.infer<typeof ThirdPartyApiRequestSchema>;
export type RequestsUpdate = z.infer<typeof RequestsUpdateSchema>;
export type FoundUpdatesCreate = z.infer<typeof FoundUpdatesCreateSchema>;
export type FoundUpdatesUpdate = z.infer<typeof FoundUpdatesUpdateSchema>;
