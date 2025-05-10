import { UserRole, EventStatus, PaymentStatus, TicketStatus, ApprovalStatus, WithdrawalStatus, DiscountType } from "@prisma/client";
import { DefaultSession } from "next-auth";

// ===== NextAuth Types =====

/**
 * Extend NextAuth User type to include role
 */
declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

/**
 * Extend NextAuth JWT type
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

/**
 * Auth Types for Client-Side Usage
 */

// User type for client-side usage
export interface AuthUser {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
  emailVerified?: Date | null;
}

// Auth state for client-side usage
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  isBuyer: boolean;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  callbackUrl?: string;
}

// Registration data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Password reset data
export interface ResetPasswordData {
  token: string;
  password: string;
}

// Verification token data
export interface VerificationTokenData {
  token: string;
}

// ===== API Types =====

/**
 * API Response type
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{ message: string }>;
  message?: string;
};

/**
 * Auth API responses
 */
export interface LoginResponse extends ApiResponse {
  data?: {
    user: AuthUser;
    redirectUrl?: string;
  };
}

export interface RegisterResponse extends ApiResponse {
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface VerifyResponse extends ApiResponse {
  data?: {
    verified: boolean;
  };
}

export interface ResetPasswordResponse extends ApiResponse {
  data?: {
    success: boolean;
  };
}

/**
 * API Request Options
 */
export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
};

// ===== Event Types =====

/**
 * Event Category
 */
export type EventCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
};

/**
 * Event Create Input
 */
export type EventCreateInput = {
  title: string;
  description?: string;
  organizerId: string;
  venue: string;
  address?: string;
  city?: string;
  province: string;
  country: string;
  category?: string;
  tags?: string[];
  startDate: Date;
  endDate: Date;
  posterUrl?: string;
  bannerUrl?: string;
  images?: string[];
  featured?: boolean;
  published?: boolean;
  seatingMap?: string;
  maxAttendees?: number;
  website?: string;
  terms?: string;
};

/**
 * Event Update Input
 */
export type EventUpdateInput = Partial<EventCreateInput> & {
  status?: EventStatus;
  slug?: string;
};

/**
 * Event with Tickets
 */
export type EventWithTickets = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  venue: string;
  address?: string | null;
  city?: string | null;
  province: string;
  country: string;
  category?: string | null;
  tags: string[];
  images: string[];
  featured: boolean;
  published: boolean;
  seatingMap?: string | null;
  maxAttendees?: number | null;
  website?: string | null;
  terms?: string | null;
  startDate: Date;
  endDate: Date;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
  organizerId: string;
  organizer: {
    id: string;
    orgName: string;
    verified: boolean;
    user: {
      id: string;
      name?: string | null;
      email: string;
    };
  };
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
  }>;
};

/**
 * Event Filter Input
 */
export type EventFilterInput = {
  status?: EventStatus;
  organizerId?: string;
  category?: string;
  city?: string;
  province?: string;
  country?: string;
  search?: string;
  upcoming?: boolean;
  featured?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
};

// ===== Ticket Types =====

/**
 * Ticket Type Create Input
 */
export type TicketTypeCreateInput = {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  quantity: number;
  maxPerPurchase?: number;
  isVisible?: boolean;
  allowTransfer?: boolean;
  ticketFeatures?: string;
  perks?: string;
  earlyBirdDeadline?: Date;
  saleStartDate?: Date;
  saleEndDate?: Date;
};

/**
 * Ticket Type Update Input
 */
export type TicketTypeUpdateInput = Partial<Omit<TicketTypeCreateInput, "eventId">> & {
  sold?: number;
};

/**
 * Ticket Create Input
 */
export type TicketCreateInput = {
  ticketTypeId: string;
  transactionId: string;
  userId: string;
  qrCode: string;
  status?: TicketStatus;
};

/**
 * Ticket Update Input
 */
export type TicketUpdateInput = {
  status?: TicketStatus;
  checkedIn?: boolean;
  checkInTime?: Date;
};

/**
 * Ticket Validation Input
 */
export type ValidateTicketInput = {
  ticketId: string;
  eventId?: string;
};

/**
 * Ticket Filter Input
 */
export type TicketFilterInput = {
  eventId?: string;
  userId?: string;
  ticketTypeId?: string;
  status?: TicketStatus;
  checkedIn?: boolean;
  limit?: number;
  offset?: number;
};

// ===== Transaction Types =====

/**
 * Transaction Create Input
 */
export type TransactionCreateInput = {
  userId: string;
  eventId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  paymentReference?: string;
  invoiceNumber: string;
  status?: PaymentStatus;
  details?: Record<string, any>;
};

/**
 * Transaction Update Input
 */
export type TransactionUpdateInput = {
  status?: PaymentStatus;
  paymentReference?: string;
  details?: Record<string, any>;
};

/**
 * Order Item Create Input
 */
export type OrderItemCreateInput = {
  orderId: string;
  ticketTypeId: string;
  quantity: number;
  price: number;
};

/**
 * Transaction Filter Input
 */
export type TransactionFilterInput = {
  userId?: string;
  eventId?: string;
  status?: PaymentStatus;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
};

// ===== Payment Types =====

/**
 * Payment Create Input
 */
export type PaymentCreateInput = {
  orderId: string;
  gateway: string;
  amount: number;
  status?: PaymentStatus;
};

/**
 * Payment Update Input
 */
export type PaymentUpdateInput = {
  status?: PaymentStatus;
  paymentId?: string;
  hmacSignature?: string;
  callbackPayload?: Record<string, any>;
  receivedAt?: Date;
};

/**
 * Payment Filter Input
 */
export type PaymentFilterInput = {
  orderId?: string;
  status?: PaymentStatus;
  gateway?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
};

// ===== E-Ticket Types =====

/**
 * E-Ticket Create Input
 */
export type ETicketCreateInput = {
  orderId: string;
  qrCodeData: string;
  fileUrl?: string;
};

/**
 * E-Ticket Update Input
 */
export type ETicketUpdateInput = {
  fileUrl?: string;
  delivered?: boolean;
  deliveredAt?: Date;
  scannedAt?: Date;
};

/**
 * E-Ticket Validation Input
 */
export type ValidateETicketInput = {
  qrCodeData: string;
};

/**
 * E-Ticket Generation Input
 */
export type GenerateETicketsInput = {
  orderId: string;
};

/**
 * E-Ticket Filter Input
 */
export type ETicketFilterInput = {
  orderId?: string;
  delivered?: boolean;
  scanned?: boolean;
  limit?: number;
  offset?: number;
};

// ===== Organizer Types =====

/**
 * Organizer Create Input
 */
export type OrganizerCreateInput = {
  userId: string;
  orgName: string;
  legalName?: string;
  npwp?: string;
  socialMedia?: Record<string, any>;
  verificationDocs?: string;
};

/**
 * Organizer Update Input
 */
export type OrganizerUpdateInput = {
  orgName?: string;
  legalName?: string;
  npwp?: string;
  socialMedia?: Record<string, any>;
  verificationDocs?: string;
  verified?: boolean;
};

/**
 * Organizer Filter Input
 */
export type OrganizerFilterInput = {
  userId?: string;
  verified?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

// ===== Bank Account Types =====

/**
 * Bank Account Create Input
 */
export type BankAccountCreateInput = {
  organizerId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
};

/**
 * Bank Account Update Input
 */
export type BankAccountUpdateInput = {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branch?: string;
};

// ===== Withdrawal Types =====

/**
 * Withdrawal Create Input
 */
export type WithdrawalCreateInput = {
  organizerId: string;
  amount: number;
  currency?: string;
  reference?: string;
  notes?: string;
};

/**
 * Withdrawal Update Input
 */
export type WithdrawalUpdateInput = {
  status?: WithdrawalStatus;
  reference?: string;
  notes?: string;
  processedAt?: Date;
};

/**
 * Withdrawal Filter Input
 */
export type WithdrawalFilterInput = {
  organizerId?: string;
  status?: WithdrawalStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
};

// ===== Crew Types =====

/**
 * Crew Create Input
 */
export type CrewCreateInput = {
  organizerId: string;
  eventId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  idCardNumber: string;
  barcode: string;
  isActive?: boolean;
};

/**
 * Crew Update Input
 */
export type CrewUpdateInput = {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
};

/**
 * Crew Filter Input
 */
export type CrewFilterInput = {
  organizerId?: string;
  eventId?: string;
  role?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

// ===== Voucher Types =====

/**
 * Voucher Create Input
 */
export type VoucherCreateInput = {
  organizerId: string;
  eventId?: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsage: number;
  minPurchaseAmount?: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
};

/**
 * Voucher Update Input
 */
export type VoucherUpdateInput = {
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  maxUsage?: number;
  usedCount?: number;
  minPurchaseAmount?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
};

/**
 * Voucher Filter Input
 */
export type VoucherFilterInput = {
  organizerId?: string;
  eventId?: string;
  code?: string;
  isActive?: boolean;
  isValid?: boolean; // Checks if current date is between startDate and endDate
  limit?: number;
  offset?: number;
};

// ===== Validator Types =====

/**
 * Validator Create Input
 */
export type ValidatorCreateInput = {
  userId: string;
  eventIds: string[];
};

/**
 * Validator Update Input
 */
export type ValidatorUpdateInput = {
  eventIds?: string[];
};

/**
 * Validator Filter Input
 */
export type ValidatorFilterInput = {
  userId?: string;
  eventId?: string;
  limit?: number;
  offset?: number;
};

// ===== Approval Types =====

/**
 * Approval Create Input
 */
export type ApprovalCreateInput = {
  entityType: string;
  entityId: string;
  reviewerId?: string;
  status?: ApprovalStatus;
  notes?: string;
};

/**
 * Approval Update Input
 */
export type ApprovalUpdateInput = {
  reviewerId?: string;
  status?: ApprovalStatus;
  notes?: string;
  reviewedAt?: Date;
};

/**
 * Approval Filter Input
 */
export type ApprovalFilterInput = {
  entityType?: string;
  entityId?: string;
  reviewerId?: string;
  status?: ApprovalStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
};

// ===== Log Types =====

/**
 * Log Create Input
 */
export type LogCreateInput = {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, any>;
};

/**
 * Log Filter Input
 */
export type LogFilterInput = {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
};
