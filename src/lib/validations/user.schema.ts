import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Validation schema for User
export const userSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
  name: z.string().min(1, { message: 'Name cannot be empty' }).optional(),
  email: z.string().email({ message: 'Invalid email format' }),
  emailVerified: z.string().datetime({ message: 'Invalid datetime format for emailVerified' }).optional(),
  image: z.string().url({ message: 'Invalid URL format for image' }).optional(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' }).optional(),
  role: z.enum(['ADMIN', 'ORGANIZER', 'BUYER'], { message: 'Invalid user role' }),
  createdAt: z.string().datetime({ message: 'Invalid datetime format for createdAt' }),
  updatedAt: z.string().datetime({ message: 'Invalid datetime format for updatedAt' }),
});

// Export TypeScript type from the schema
export type UserSchema = z.infer<typeof userSchema>;
