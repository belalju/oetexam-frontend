import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreatePaymentSessionRequest,
  OrderValidationResult,
  PaymentSession,
} from '../models/payment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.API_URL;

  /** Creates an SSLCommerz session; the customer is then sent to its gatewayPageUrl. */
  createSession(payload: CreatePaymentSessionRequest) {
    return this.http
      .post<ApiResponse<PaymentSession>>(`${this.API_URL}/payments/sessions`, payload)
      .pipe(map((res) => res.data));
  }

  /** Confirms a payment with SSLCommerz; safe to repeat, it returns the stored result once settled. */
  validateOrder(transactionId: string, validationId: string) {
    return this.http
      .post<ApiResponse<OrderValidationResult>>(`${this.API_URL}/payments/validate`, { transactionId, validationId })
      .pipe(map((res) => res.data));
  }
}
