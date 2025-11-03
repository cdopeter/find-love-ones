import { z } from 'zod';
import { JAMAICAN_PARISHES } from '../constants/parishes';

/**
 * Zod validation schema for the missing person request form
 */
export const requestFormSchema = z.object({
  // Target person information
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be less than 100 characters'),
  
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be less than 100 characters'),
  
  age: z
    .number()
    .int('Age must be a whole number')
    .min(0, 'Age must be a positive number')
    .max(150, 'Age must be a valid number')
    .optional()
    .nullable(),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  // Location information
  last_seen_location: z
    .string()
    .min(1, 'Last seen location is required')
    .max(200, 'Location must be less than 200 characters'),
  
  last_seen_date: z
    .string()
    .optional(),
  
  parish: z
    .enum(JAMAICAN_PARISHES as [string, ...string[]])
    .refine((val) => JAMAICAN_PARISHES.includes(val), {
      message: 'Please select a valid parish',
    }),
  
  // Requester/Contact information
  contact_name: z
    .string()
    .min(1, 'Contact name is required')
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name must be less than 100 characters'),
  
  contact_phone: z
    .string()
    .regex(
      /^(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/,
      'Please enter a valid phone number'
    )
    .optional()
    .or(z.literal('')),
  
  contact_email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  
  // Optional message/notes
  notes: z
    .string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
});

export type RequestFormData = z.infer<typeof requestFormSchema>;
