import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../../auth/services/auth';
import { findPackage } from '../../models/package';
import { OrderValidationResult } from '../../models/payment';
import { PaymentService } from '../../services/payment';

type Outcome = 'success' | 'fail' | 'cancel';
type View = 'verifying' | 'paid' | 'onHold' | 'unverified' | 'failed' | 'cancelled';

/**
 * Landing page for /payment/success, /payment/fail and /payment/cancel. The backend
 * callback redirects here after SSLCommerz; the success page re-confirms the payment
 * so it never shows "paid" on the strength of the URL alone.
 */
@Component({
  selector: 'app-payment-result',
  imports: [RouterLink],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.css',
})
export class PaymentResult implements OnInit {
  private route = inject(ActivatedRoute);
  private payments = inject(PaymentService);
  protected auth = inject(Auth);

  view = signal<View>('verifying');
  transactionId = signal<string | null>(null);
  result = signal<OrderValidationResult | null>(null);

  packageName = computed(() => {
    const pkg = findPackage(this.result()?.packageId ?? null);
    return pkg ? `${pkg.name} Package` : null;
  });

  ngOnInit() {
    const outcome = this.route.snapshot.data['outcome'] as Outcome;
    const query = this.route.snapshot.queryParamMap;
    const transactionId = query.get('tran_id');
    this.transactionId.set(transactionId);

    if (outcome === 'fail') return this.view.set('failed');
    if (outcome === 'cancel') return this.view.set('cancelled');

    const validationId = query.get('val_id');
    if (!transactionId || !validationId || !this.auth.isAuthenticated()) {
      return this.view.set('unverified');
    }
    this.verify(transactionId, validationId);
  }

  private verify(transactionId: string, validationId: string) {
    this.payments.validateOrder(transactionId, validationId).subscribe({
      next: (result) => {
        this.result.set(result);
        if (result.status === 'VALID') this.view.set('paid');
        else if (result.status === 'ON_HOLD') this.view.set('onHold');
        else this.view.set('failed');
      },
      // 400 means SSLCommerz rejected the transaction; anything else is "could not check right now".
      error: (err: HttpErrorResponse) => this.view.set(err.status === 400 ? 'failed' : 'unverified'),
    });
  }
}
