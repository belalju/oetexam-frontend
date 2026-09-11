import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [RouterLink],
  templateUrl: './terms-and-conditions.html',
  styleUrl: './terms-and-conditions.css',
})
export class TermsAndConditions {
  readonly lastUpdated = '10 September 2026';

  readonly contactEmail = 'mentor@oetpractice.org';

  readonly sections = [
    { id: 'our-services', title: 'Our Services' },
    { id: 'eligibility-and-accounts', title: 'Eligibility and Accounts' },
    { id: 'free-and-paid-access', title: 'Free and Paid Access' },
    { id: 'writing-and-speaking-evaluation', title: 'Writing and Speaking Evaluation' },
    { id: 'prices-and-payments', title: 'Prices and Payments' },
    { id: 'refunds-and-cancellations', title: 'Refunds and Cancellations' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'acceptable-use', title: 'Acceptable Use' },
    { id: 'no-score-guarantee', title: 'No Score Guarantee' },
    { id: 'availability-and-changes', title: 'Availability and Changes' },
    { id: 'third-party-services-and-links', title: 'Third-Party Services and Links' },
    { id: 'limitation-of-liability', title: 'Limitation of Liability' },
    { id: 'privacy', title: 'Privacy' },
    { id: 'changes-to-these-terms', title: 'Changes to These Terms' },
    { id: 'governing-law-and-disputes', title: 'Governing Law and Disputes' },
    { id: 'contact', title: 'Contact' },
  ];

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
