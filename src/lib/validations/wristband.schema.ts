import { z } from "zod";
import { WristbandQRCodeStatus } from "@prisma/client";

/**
 * Schema for creating a new wristband
 */
export const createWristbandSchema = z.object({
  eventId: z.string().cuid({ message: "Invalid event ID format" }),
  name: z
    .string()
    .min(1, { message: "Wristband name is required" })
    .max(100, { message: "Wristband name cannot exceed 100 characters" })
    .trim(),
  description: z
    .string()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .optional(),
  validFrom: z
    .string()
    .datetime({ message: "Invalid datetime format for valid from" })
    .optional(),
  validUntil: z
    .string()
    .datetime({ message: "Invalid datetime format for valid until" })
    .optional(),
  maxScans: z
    .number()
    .int()
    .positive({ message: "Max scans must be a positive integer" })
    .optional(),
  codeType: z
    .enum(["QR", "BARCODE"], { message: "Code type must be QR or BARCODE" })
    .optional()
    .default("BARCODE"),
  isReusable: z.boolean().optional().default(true),
})
.refine((data) => {
  // Validate that validUntil is after validFrom
  if (data.validFrom && data.validUntil) {
    const fromDate = new Date(data.validFrom);
    const untilDate = new Date(data.validUntil);
    return untilDate > fromDate;
  }
  return true;
}, {
  message: "Valid until date must be after valid from date",
  path: ["validUntil"],
});

/**
 * Schema for updating an existing wristband
 */
export const updateWristbandSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Wristband name is required" })
    .max(100, { message: "Wristband name cannot exceed 100 characters" })
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .optional(),
  validFrom: z
    .string()
    .datetime({ message: "Invalid datetime format for valid from" })
    .optional(),
  validUntil: z
    .string()
    .datetime({ message: "Invalid datetime format for valid until" })
    .optional(),
  maxScans: z
    .number()
    .int()
    .positive({ message: "Max scans must be a positive integer" })
    .optional(),
  isReusable: z.boolean().optional(),
  status: z.nativeEnum(WristbandQRCodeStatus).optional(),
})
.refine((data) => {
  // Validate that validUntil is after validFrom
  if (data.validFrom && data.validUntil) {
    const fromDate = new Date(data.validFrom);
    const untilDate = new Date(data.validUntil);
    return untilDate > fromDate;
  }
  return true;
}, {
  message: "Valid until date must be after valid from date",
  path: ["validUntil"],
});

/**
 * Schema for deleting a wristband (soft delete)
 */
export const deleteWristbandSchema = z.object({
  id: z.string().cuid({ message: "Invalid wristband ID format" }),
  reason: z
    .string()
    .min(1, { message: "Deletion reason is required" })
    .max(500, { message: "Reason cannot exceed 500 characters" })
    .optional(),
});

/**
 * Schema for bulk operations on wristbands
 */
export const bulkWristbandOperationSchema = z.object({
  wristbandIds: z
    .array(z.string().cuid({ message: "Invalid wristband ID format" }))
    .min(1, { message: "At least one wristband must be selected" }),
  operation: z.enum(["delete", "activate", "deactivate", "revoke", "export"], {
    message: "Invalid operation type",
  }),
  reason: z
    .string()
    .max(500, { message: "Reason cannot exceed 500 characters" })
    .optional(),
});

/**
 * Schema for wristband filtering and search
 */
export const wristbandFilterSchema = z.object({
  search: z.string().optional(),
  eventId: z.string().cuid().optional(),
  status: z.nativeEnum(WristbandQRCodeStatus).optional(),
  codeType: z.enum(["QR", "BARCODE"]).optional(),
  isReusable: z.boolean().optional(),
  validFromStart: z.string().datetime().optional(),
  validFromEnd: z.string().datetime().optional(),
  validUntilStart: z.string().datetime().optional(),
  validUntilEnd: z.string().datetime().optional(),
  sortBy: z
    .enum([
      "name",
      "status",
      "scanCount",
      "maxScans",
      "validFrom",
      "validUntil",
      "createdAt",
      "updatedAt",
    ])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  includeDeleted: z.boolean().optional().default(false),
});

/**
 * Schema for wristband status update
 */
export const updateWristbandStatusSchema = z.object({
  status: z.nativeEnum(WristbandQRCodeStatus),
  reason: z
    .string()
    .max(500, { message: "Reason cannot exceed 500 characters" })
    .optional(),
});

/**
 * Schema for wristband scan validation
 */
export const validateWristbandScanSchema = z.object({
  qrCodeData: z.string().optional(),
  barcodeData: z.string().optional(),
  codeData: z.string().min(1, "Code data is required"),
  codeType: z.enum(["QR", "BARCODE"]).optional().default("BARCODE"),
  scan: z.boolean().optional().default(false),
  scanLocation: z.string().optional(),
  scanDevice: z.string().optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.qrCodeData || data.barcodeData || data.codeData,
  {
    message: "Either qrCodeData, barcodeData, or codeData is required",
  }
);

/**
 * Schema for wristband scan log
 */
export const wristbandScanLogSchema = z.object({
  wristbandId: z.string().cuid({ message: "Invalid wristband ID format" }),
  scanLocation: z.string().optional(),
  scanDevice: z.string().optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Export TypeScript types from the schemas
 */
export type CreateWristbandSchema = z.infer<typeof createWristbandSchema>;
export type UpdateWristbandSchema = z.infer<typeof updateWristbandSchema>;
export type DeleteWristbandSchema = z.infer<typeof deleteWristbandSchema>;
export type BulkWristbandOperationSchema = z.infer<typeof bulkWristbandOperationSchema>;
export type WristbandFilterSchema = z.infer<typeof wristbandFilterSchema>;
export type UpdateWristbandStatusSchema = z.infer<typeof updateWristbandStatusSchema>;
export type ValidateWristbandScanSchema = z.infer<typeof validateWristbandScanSchema>;
export type WristbandScanLogSchema = z.infer<typeof wristbandScanLogSchema>;

/**
 * Schema for wristband export options
 */
export const wristbandExportSchema = z.object({
  format: z.enum(["csv", "json"]).optional().default("csv"),
  includeScans: z.boolean().optional().default(false),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
});

export type WristbandExportSchema = z.infer<typeof wristbandExportSchema>;
