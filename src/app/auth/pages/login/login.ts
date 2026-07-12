import { AfterViewInit, Component, ElementRef, inject, NgZone, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { GoogleIdentity } from '../../services/google-identity';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';

const EMAIL_NOT_VERIFIED_MESSAGE = 'Email not verified. Please check your inbox.';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  private fb = inject(FormBuilder);
  private googleIdentity = inject(GoogleIdentity);
  private zone = inject(NgZone);
  protected auth = inject(Auth);

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLElement>;

  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  showResendBanner = signal(false);
  resendSent = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  ngAfterViewInit() {
    this.googleIdentity
      .renderButton(this.googleBtn.nativeElement, (idToken) =>
        this.zone.run(() =>
          this.auth.loginWithGoogle(idToken).subscribe({
            error: (err) => toast.error(err?.error?.error || 'Google sign-in failed.'),
          })
        )
      )
      .catch(() => toast.error('Could not load Google Sign-In.'));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.showResendBanner.set(false);
    this.resendSent.set(false);
    this.auth.login(this.form.value as any).subscribe({
      error: (err) => {
        const message = err?.error?.error || 'Login failed. Please check your credentials.';
        toast.error(message);
        this.errorMessage.set(message);
        this.showResendBanner.set(message === EMAIL_NOT_VERIFIED_MESSAGE);
      }
    });
  }

  onResend() {
    const email = this.email.value;
    if (!email) return;
    this.auth.resendVerification(email).subscribe({
      next: () => {
        this.resendSent.set(true);
        toast.success('Verification email sent. Please check your inbox.');
      },
      error: () => toast.error('Could not resend verification email. Please try again.'),
    });
  }
}
