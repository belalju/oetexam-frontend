import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

type VerifyState = 'verifying' | 'success' | 'error';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink, FormsModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  protected auth = inject(Auth);

  state = signal<VerifyState>('verifying');
  errorMessage = signal<string | null>(null);
  resendSent = signal(false);
  emailInput = signal('');

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('error');
      this.errorMessage.set('Missing verification token.');
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: () => this.state.set('success'),
      error: (err) => {
        this.state.set('error');
        this.errorMessage.set(err?.error?.error || 'This verification link is invalid or has expired.');
      },
    });
  }

  onResend() {
    const email = this.emailInput().trim();
    if (!email) return;
    this.auth.resendVerification(email).subscribe({
      next: () => this.resendSent.set(true),
      error: () => this.errorMessage.set('Could not resend verification email. Please try again.'),
    });
  }
}
