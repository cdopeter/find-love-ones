/**
 * Third-Party API Allowlist Configuration
 * Defines which tables and columns third-party applications can access
 */

export interface TableAllowlist {
  table: string;
  allowedFields: string[];
  requiredFields: string[];
  readOnlyFields?: string[];
  validators?: Record<string, (value: unknown) => boolean>;
}

/**
 * Allowlist for requests table
 * Third-party apps can read all fields except requester_email and requester_phone
 */
export const REQUESTS_ALLOWLIST: TableAllowlist = {
  table: 'requests',
  allowedFields: [
    'id',
    'created_at',
    'target_first_name',
    'target_last_name',
    'age',
    'gender',
    'nickname',
    'last_known_address',
    'parish',
    'lat',
    'lng',
    'status',
    'message_to_person',
    'email_sent_at',
  ],
  requiredFields: [],
  readOnlyFields: ['id', 'created_at', 'email_sent_at'],
  validators: {
    status: (value: unknown) => {
      return typeof value === 'string' && ['open', 'closed'].includes(value);
    },
    parish: (value: unknown) => {
      const validParishes = [
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
      ];
      return typeof value === 'string' && validParishes.includes(value);
    },
  },
};

/**
 * Allowlist for found_updates table
 * Third-party apps have full access to all fields
 */
export const FOUND_UPDATES_ALLOWLIST: TableAllowlist = {
  table: 'found_updates',
  allowedFields: [
    'id',
    'request_id',
    'message_from_found_party',
    'created_by',
    'created_at',
  ],
  requiredFields: ['request_id', 'message_from_found_party'],
  readOnlyFields: ['id', 'created_at'],
  validators: {
    message_from_found_party: (value: unknown) => {
      return (
        typeof value === 'string' && value.length > 0 && value.length <= 5000
      );
    },
  },
};

/**
 * Combined allowlist for all tables
 */
export const TABLE_ALLOWLISTS: Record<string, TableAllowlist> = {
  requests: REQUESTS_ALLOWLIST,
  found_updates: FOUND_UPDATES_ALLOWLIST,
};

/**
 * Check if a table is allowed for third-party access
 */
export function isTableAllowed(table: string): boolean {
  return table in TABLE_ALLOWLISTS;
}

/**
 * Check if a field is allowed for a given table
 */
export function isFieldAllowed(table: string, field: string): boolean {
  const allowlist = TABLE_ALLOWLISTS[table];
  if (!allowlist) return false;
  return allowlist.allowedFields.includes(field);
}

/**
 * Check if a field is read-only for a given table
 */
export function isFieldReadOnly(table: string, field: string): boolean {
  const allowlist = TABLE_ALLOWLISTS[table];
  if (!allowlist) return true;
  return allowlist.readOnlyFields?.includes(field) ?? false;
}

/**
 * Validate field value using custom validator if available
 */
export function validateFieldValue(
  table: string,
  field: string,
  value: unknown
): boolean {
  const allowlist = TABLE_ALLOWLISTS[table];
  if (!allowlist) return false;

  const validator = allowlist.validators?.[field];
  if (validator) {
    return validator(value);
  }

  return true; // No validator means any value is acceptable
}

/**
 * Filter patch object to only include allowed fields
 * Returns filtered patch and list of rejected fields
 */
export function filterPatch(
  table: string,
  patch: Record<string, unknown>
): { allowed: Record<string, unknown>; rejected: string[] } {
  const allowlist = TABLE_ALLOWLISTS[table];
  if (!allowlist) {
    return { allowed: {}, rejected: Object.keys(patch) };
  }

  const allowed: Record<string, unknown> = {};
  const rejected: string[] = [];

  for (const [field, value] of Object.entries(patch)) {
    // Check if field is in allowlist
    if (!isFieldAllowed(table, field)) {
      rejected.push(field);
      continue;
    }

    // Check if field is read-only
    if (isFieldReadOnly(table, field)) {
      rejected.push(field);
      continue;
    }

    // Validate field value
    if (!validateFieldValue(table, field, value)) {
      rejected.push(field);
      continue;
    }

    allowed[field] = value;
  }

  return { allowed, rejected };
}

/**
 * Check if all required fields are present in the patch
 */
export function validateRequiredFields(
  table: string,
  patch: Record<string, unknown>
): string[] {
  const allowlist = TABLE_ALLOWLISTS[table];
  if (!allowlist) return [];

  const missing: string[] = [];
  for (const field of allowlist.requiredFields) {
    if (
      !(field in patch) ||
      patch[field] === null ||
      patch[field] === undefined
    ) {
      missing.push(field);
    }
  }

  return missing;
}
