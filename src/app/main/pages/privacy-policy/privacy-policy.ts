import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.css',
})
export class PrivacyPolicy {
  readonly contactEmail = 'mentor@oetpractice.org';

  readonly sections = [
    { id: 'information-we-collect', title: 'Information We Collect' },
    { id: 'how-we-use-information', title: 'How We Use Information' },
    { id: 'sharing-information', title: 'Sharing Information' },
    { id: 'writing-and-speaking-submissions', title: 'Writing and Speaking Submissions' },
    { id: 'data-retention', title: 'Data Retention' },
    { id: 'cookies-and-analytics', title: 'Cookies and Analytics' },
    { id: 'international-users', title: 'International Users' },
    { id: 'your-rights', title: 'Your Rights' },

    { id: 'security', title: 'Security' },
    { id: 'childrens-privacy', title: 'Children’s Privacy' },
    { id: 'changes-to-this-policy', title: 'Changes to This Policy' },
    { id: 'contact-us', title: 'Contact Us' },
  ];

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
