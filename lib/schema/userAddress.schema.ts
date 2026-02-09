import { z } from 'zod';

export const userAddressSchema = z.object({
  id: z.string().uuid().optional(),

  userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),

  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(1, 'Full name cannot be empty'),

  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .min(10, 'Phone number must be at least 10 digits'),

  addressLine1: z
    .string({ required_error: 'Address is required' })
    .min(1, 'Address cannot be empty'),

  addressLine2: z.string().optional().nullable(),

  city: z.string({ required_error: 'City is required' }),

  state: z.string({ required_error: 'State is required' }),

  postalCode: z
    .string({ required_error: 'Postal code is required' })
    .regex(/^\d{5,10}$/, 'Postal code must be 5-10 digits'),

  country: z.string({ required_error: 'Country is required' }),

  isDefault: z.boolean().optional().default(false),
});

export type UserAddressSchemaType = z.infer<typeof userAddressSchema>;
export const userAddressUpdateSchema = userAddressSchema.partial();
