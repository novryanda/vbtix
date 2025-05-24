import { Xendit } from 'xendit-node';
import { env } from '~/env';

// Initialize Xendit client
let xenditClient: Xendit | null = null;

export function getXenditClient(): Xendit {
  if (!xenditClient) {
    if (!env.XENDIT_SECRET_KEY) {
      throw new Error('XENDIT_SECRET_KEY is not configured');
    }
    
    xenditClient = new Xendit({
      secretKey: env.XENDIT_SECRET_KEY,
    });
  }
  
  return xenditClient;
}

// Payment method types supported by Xendit
export enum XenditPaymentMethod {
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
  EWALLET = 'EWALLET',
  QR_CODE = 'QR_CODE',
  RETAIL_OUTLET = 'RETAIL_OUTLET',
  CREDIT_CARD = 'CREDIT_CARD',
}

// Virtual Account bank codes
export enum VirtualAccountBank {
  BCA = 'BCA',
  BNI = 'BNI',
  BRI = 'BRI',
  MANDIRI = 'MANDIRI',
  PERMATA = 'PERMATA',
  BSI = 'BSI',
}

// E-Wallet types
export enum EWalletType {
  OVO = 'OVO',
  DANA = 'DANA',
  LINKAJA = 'LINKAJA',
  SHOPEEPAY = 'SHOPEEPAY',
  GOPAY = 'GOPAY',
}

// QR Code types
export enum QRCodeType {
  QRIS = 'QRIS',
}

// Retail outlet types
export enum RetailOutletType {
  ALFAMART = 'ALFAMART',
  INDOMARET = 'INDOMARET',
}

export interface CreatePaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: XenditPaymentMethod;
  paymentMethodDetails: {
    virtualAccount?: {
      bankCode: VirtualAccountBank;
    };
    ewallet?: {
      type: EWalletType;
      redirectUrl?: string;
    };
    qrCode?: {
      type: QRCodeType;
    };
    retailOutlet?: {
      type: RetailOutletType;
    };
  };
  customer: {
    referenceId: string;
    email: string;
    mobileNumber?: string;
    givenNames?: string;
  };
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  actions?: Array<{
    action: string;
    url?: string;
    urlType?: string;
    method?: string;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Create a payment using Xendit Payments API
 */
export async function createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
  const xendit = getXenditClient();
  const { Payment } = xendit;

  try {
    // Prepare payment request based on payment method
    let paymentRequest: any = {
      referenceId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      customer: params.customer,
      metadata: params.metadata,
    };

    // Add payment method specific configuration
    switch (params.paymentMethod) {
      case XenditPaymentMethod.VIRTUAL_ACCOUNT:
        paymentRequest.paymentMethod = {
          type: 'VIRTUAL_ACCOUNT',
          virtualAccount: {
            channelCode: params.paymentMethodDetails.virtualAccount?.bankCode,
            channelProperties: {
              customerName: params.customer.givenNames || params.customer.email,
            },
          },
          reusability: 'ONE_TIME_USE',
        };
        break;

      case XenditPaymentMethod.EWALLET:
        paymentRequest.paymentMethod = {
          type: 'EWALLET',
          ewallet: {
            channelCode: params.paymentMethodDetails.ewallet?.type,
            channelProperties: {
              successRedirectUrl: params.paymentMethodDetails.ewallet?.redirectUrl,
              failureRedirectUrl: params.paymentMethodDetails.ewallet?.redirectUrl,
            },
          },
          reusability: 'ONE_TIME_USE',
        };
        break;

      case XenditPaymentMethod.QR_CODE:
        paymentRequest.paymentMethod = {
          type: 'QR_CODE',
          qrCode: {
            channelCode: params.paymentMethodDetails.qrCode?.type,
          },
          reusability: 'ONE_TIME_USE',
        };
        break;

      case XenditPaymentMethod.RETAIL_OUTLET:
        paymentRequest.paymentMethod = {
          type: 'OVER_THE_COUNTER',
          overTheCounter: {
            channelCode: params.paymentMethodDetails.retailOutlet?.type,
            channelProperties: {
              customerName: params.customer.givenNames || params.customer.email,
            },
          },
          reusability: 'ONE_TIME_USE',
        };
        break;

      default:
        throw new Error(`Unsupported payment method: ${params.paymentMethod}`);
    }

    const response = await Payment.createPayment({
      data: paymentRequest,
    });

    return {
      id: response.id!,
      status: response.status!,
      amount: response.amount!,
      currency: response.currency!,
      paymentMethod: response.paymentMethod?.type || params.paymentMethod,
      actions: response.actions,
      metadata: response.metadata,
    };
  } catch (error) {
    console.error('Error creating Xendit payment:', error);
    throw new Error(`Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get payment status from Xendit
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
  const xendit = getXenditClient();
  const { Payment } = xendit;

  try {
    const response = await Payment.getPayment({
      paymentId,
    });

    return {
      id: response.id!,
      status: response.status!,
      amount: response.amount!,
      currency: response.currency!,
      paymentMethod: response.paymentMethod?.type || 'UNKNOWN',
      actions: response.actions,
      metadata: response.metadata,
    };
  } catch (error) {
    console.error('Error getting Xendit payment status:', error);
    throw new Error(`Failed to get payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookToken: string
): boolean {
  try {
    // Xendit uses HMAC-SHA256 for webhook verification
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookToken)
      .update(rawBody)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Map Xendit payment status to our internal status
 */
export function mapXenditStatusToInternal(xenditStatus: string): 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' {
  switch (xenditStatus.toLowerCase()) {
    case 'succeeded':
    case 'paid':
      return 'SUCCESS';
    case 'pending':
    case 'awaiting_capture':
      return 'PENDING';
    case 'failed':
    case 'cancelled':
      return 'FAILED';
    case 'expired':
      return 'EXPIRED';
    default:
      return 'PENDING';
  }
}
