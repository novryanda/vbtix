import { z } from 'zod';

/**
 * Validation schema for social media links
 */
export const socialMediaSchema = z.object({
  website: z.string().url({ message: 'Invalid website URL' }).optional().nullable(),
  facebook: z.string().url({ message: 'Invalid Facebook URL' }).optional().nullable(),
  twitter: z.string().url({ message: 'Invalid Twitter URL' }).optional().nullable(),
  instagram: z.string().url({ message: 'Invalid Instagram URL' }).optional().nullable(),
  linkedin: z.string().url({ message: 'Invalid LinkedIn URL' }).optional().nullable(),
  youtube: z.string().url({ message: 'Invalid YouTube URL' }).optional().nullable(),
  tiktok: z.string().url({ message: 'Invalid TikTok URL' }).optional().nullable(),
});

/**
 * Validation schema for bank account
 */
export const bankAccountSchema = z.object({
  id: z.string().optional(),
  organizerId: z.string().optional(),
  bankName: z.string().min(1, { message: 'Bank name is required' }),
  accountName: z.string().min(1, { message: 'Account name is required' }),
  accountNumber: z.string().min(1, { message: 'Account number is required' }),
  branch: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Validation schema for Organizer
 */
export const organizerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  orgName: z.string().min(1, { message: 'Organization name is required' }),
  legalName: z.string().optional().nullable(),
  npwp: z.string().optional().nullable(),
  bankAccount: bankAccountSchema.optional().nullable(),
  socialMedia: socialMediaSchema.optional().nullable(),
  verificationDocs: z.string().optional().nullable(),
  verified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Export TypeScript type from the schema
 */
export type OrganizerSchema = z.infer<typeof organizerSchema>;

/**
 * Schema for creating a new organizer
 */
export const createOrganizerSchema = z.object({
  orgName: z.string().min(1, { message: 'Organization name is required' }),
  legalName: z.string().optional(),
  npwp: z.string().optional(),
  socialMedia: socialMediaSchema.optional(),
  verificationDocs: z.string().optional(),
});

/**
 * Schema for updating organizer settings
 */
export const updateOrganizerSettingsSchema = z.object({
  orgName: z.string().min(1, { message: 'Organization name is required' }).optional(),
  legalName: z.string().optional(),
  npwp: z.string().optional(),
  socialMedia: socialMediaSchema.optional(),
  bankAccount: z.object({
    bankName: z.string().min(1, { message: 'Bank name is required' }),
    accountName: z.string().min(1, { message: 'Account name is required' }),
    accountNumber: z.string().min(1, { message: 'Account number is required' }),
    branch: z.string().optional(),
  }).optional(),
});

/**
 * Schema for verifying an organizer
 */
export const verifyOrganizerSchema = z.object({
  verified: z.boolean(),
  notes: z.string().optional(),
});

/**
 * Schema for updating bank account
 */
export const updateBankAccountSchema = z.object({
  bankName: z.string().min(1, { message: 'Bank name is required' }),
  accountName: z.string().min(1, { message: 'Account name is required' }),
  accountNumber: z.string().min(1, { message: 'Account number is required' }),
  branch: z.string().optional(),
});

/**
 * Schema for organizer query parameters
 */
export const organizerQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  search: z.string().optional(),
  verified: z.string().optional().transform(val => {
    if (val === undefined || val === null || val === '') return undefined;
    return val.toLowerCase() === 'true';
  }),
});

/**
 * Export TypeScript types from schemas
 */
export type CreateOrganizerSchema = z.infer<typeof createOrganizerSchema>;
export type UpdateOrganizerSettingsSchema = z.infer<typeof updateOrganizerSettingsSchema>;
export type VerifyOrganizerSchema = z.infer<typeof verifyOrganizerSchema>;
export type UpdateBankAccountSchema = z.infer<typeof updateBankAccountSchema>;
export type OrganizerQuerySchema = z.infer<typeof organizerQuerySchema>;
export type SocialMediaSchema = z.infer<typeof socialMediaSchema>;
export type BankAccountSchema = z.infer<typeof bankAccountSchema>;
