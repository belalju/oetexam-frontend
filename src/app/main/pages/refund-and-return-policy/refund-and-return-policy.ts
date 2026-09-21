import { Component } from '@angular/core';

@Component({
  selector: 'app-refund-and-return-policy',
  imports: [],
  templateUrl: './refund-and-return-policy.html',
  styleUrl: './refund-and-return-policy.css',
})
export class RefundAndReturnPolicy {
  readonly lastUpdated = 'January 2025';

  readonly contactEmail = 'mentor@oetpractice.org';

  readonly websiteUrl = 'https://oetpractice.org/';

  readonly sections = [
    { id: 'course-refunds', title: 'Course Refunds' },
    { id: 'dropout-policy', title: 'Dropout Policy' },
    { id: 'marketplace-eligibility', title: 'Marketplace Eligibility' },
    { id: 'interpretation-and-definitions', title: 'Interpretation and Definitions' },
    { id: 'order-cancellation-rights', title: 'Your Order Cancellation Rights' },
    { id: 'conditions-for-returns', title: 'Conditions for Returns' },
    { id: 'returning-goods', title: 'Returning Goods' },
    { id: 'gifts', title: 'Gifts' },
    { id: 'contact-us', title: 'Contact Us' },
  ];

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
