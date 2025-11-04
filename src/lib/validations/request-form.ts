import { z } from 'zod';
import { JAMAICAN_PARISHES } from '../constants/parishes';

/**
 * Zod validation schema for the missing person request form
 */
export const requestFormSchema = z.object({
  // Target person information
  target_first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be less than 100 characters'),
  
  target_last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be less than 100 characters'),
  
  // Location information
  last_known_address: z
    .string()
    .min(1, 'Last known address is required')
    .max(200, 'Address must be less than 200 characters'),
  
  parish: z
    .string()
    .min(1, 'Parish is required')
    .refine((val) => JAMAICAN_PARISHES.includes(val as typeof JAMAICAN_PARISHES[number]), {
      message: 'Please select a valid parish',
    }),
  
  // Requester information
  requester_first_name: z
    .string()
    .min(1, 'Your first name is required')
    .min(2, 'Your first name must be at least 2 characters')
    .max(100, 'Your first name must be less than 100 characters'),
  
  requester_last_name: z
    .string()
    .min(1, 'Your last name is required')
    .min(2, 'Your last name must be at least 2 characters')
    .max(100, 'Your last name must be less than 100 characters'),
  
  requester_phone: z
    .string()
    .regex(
      /^(\+?1[-.\s]?)?876[-.\s]?\d{3}[-.\s]?\d{4}$|^\d{3}[-.\s]?\d{4}$/,
      'Please enter a valid Jamaican phone number (e.g., 876-123-4567 or +1-876-123-4567)'
    )
    .optional()
    .or(z.literal('')),
  
  requester_email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  // Optional message
  message_to_person: z
    .string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
});

export type RequestFormData = z.infer<typeof requestFormSchema>;
