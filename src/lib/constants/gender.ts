/**
 * Gender options for missing person requests
 * These values must match the enum in the database schema
 */

export const GENDER_VALUES = ['male', 'female', 'other', 'unspecified'] as const;

export type Gender = (typeof GENDER_VALUES)[number];

/**
 * Gender options with display labels for the form dropdown
 */
export const GENDER_OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'unspecified', label: 'Prefer not to say' },
];
