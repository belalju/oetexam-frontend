import { Component } from '@angular/core';

@Component({
  selector: 'app-refund-and-return-policy',
  imports: [],
  templateUrl: './refund-and-return-policy.html',
  styleUrl: './refund-and-return-policy.css',
})
export class RefundAndReturnPolicy {
  readonly effectiveDate = 'October 01, 2026';

  readonly contactEmail = 'mentor@oetpractice.org';

  readonly requestSubject = 'Refund or Access Adjustment Request';

  readonly requestMailto = `mailto:${this.contactEmail}?subject=${encodeURIComponent(this.requestSubject)}`;

  readonly sections = [
    { id: 'refunds-for-unused-purchases', title: 'Refunds for Unused Purchases' },
    { id: 'reallocate-access', title: 'Reallocate Access to Another Email Address' },
    { id: 'delay-access', title: 'Delay Access for Up to Six Months' },
    { id: 'requests-after-attempt', title: 'Requests After a Test Has Been Attempted' },
    { id: 'payment-errors', title: 'Payment Errors and Access Problems' },
    { id: 'evaluation-services', title: 'Writing and Speaking Evaluation Services' },
    { id: 'how-to-submit', title: 'How to Submit a Request' },
    { id: 'consumer-rights', title: 'Your Consumer Rights' },
  ];

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
