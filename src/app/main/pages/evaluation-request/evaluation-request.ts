import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

type EvaluationKind = 'speaking' | 'writing';

interface EvaluationContent {
  title: string;
  intro: string;
  subject: string;
  include: string[];
  nextSteps: string;
  disclaimer: string;
  note: string;
}

const CONTENT: Record<EvaluationKind, EvaluationContent> = {
  speaking: {
    title: 'Request Speaking Evaluation',
    intro:
      'Get targeted feedback on your OET Speaking preparation. Email us with your profession, test date, and support needs to enquire about available evaluation options.',
    subject: 'OET Speaking Evaluation Request',
    include: [
      'Full name.',
      'Healthcare profession.',
      'Country and time zone.',
      'Planned OET test date, if known.',
      'Preferred support: live role-play practice or recording review.',
      'Areas you would like help with.',
    ],
    nextSteps:
      'We will confirm whether we can support your profession and preferred format, then provide the available options, fees, scheduling details, and feedback delivery timeframe before you decide to proceed.',
    disclaimer: 'Sending an enquiry does not confirm a booking or require payment.',
    note: 'Please do not attach recordings containing real patient information or confidential workplace details. We will provide submission instructions if a recording review is arranged.',
  },
  writing: {
    title: 'Request OET Writing Evaluation',
    intro:
      'Get targeted feedback on your OET Writing preparation. Email us with your profession, test date, and support needs to enquire about available letter-evaluation options.',
    subject: 'OET Writing Evaluation Request',
    include: [
      'Full name.',
      'Healthcare profession.',
      'Country and time zone.',
      'Planned OET test date, if known.',
      'Number of letters you would like reviewed.',
      'Whether you already have a practice letter and its accompanying case notes.',
      'Areas you would like help with.',
    ],
    nextSteps:
      'We will confirm whether we can support your profession, then provide the available evaluation options, fees, submission instructions, and feedback delivery timeframe before you decide to proceed.',
    disclaimer: 'Sending an enquiry does not confirm an order or require payment.',
    note: 'Please do not attach letters or case notes containing real patient information or confidential workplace details. We will provide submission instructions once your evaluation is arranged.',
  },
};

@Component({
  selector: 'app-evaluation-request',
  imports: [],
  templateUrl: './evaluation-request.html',
  styleUrl: './evaluation-request.css',
})
export class EvaluationRequest {
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);

  readonly contactEmail = 'mentor@oetpractice.org';

  readonly content = computed(() => CONTENT[(this.data()?.['kind'] as EvaluationKind) ?? 'writing']);

  readonly mailtoHref = computed(
    () => `mailto:${this.contactEmail}?subject=${encodeURIComponent(this.content().subject)}`,
  );
}
