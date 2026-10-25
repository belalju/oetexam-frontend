export interface CreatePaymentSessionRequest {
  /** Package id from PACKAGES; the backend re-checks amount and currency against its own price list. */
  packageId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostcode: string;
  customerCountry: string;
}

export interface PaymentSession {
  transactionId: string;
  sessionKey: string;
  gatewayPageUrl: string;
}

export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  data: T;
  error: string | null;
}

export type PaymentStatus =
  | 'PENDING' | 'VALID' | 'ON_HOLD' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'UNATTEMPTED';

export interface OrderValidationResult {
  transactionId: string;
  validationId: string | null;
  packageId: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  bankTransactionId: string | null;
  cardType: string | null;
  riskLevel: number | null;
  riskTitle: string | null;
  validatedAt: string | null;
}
