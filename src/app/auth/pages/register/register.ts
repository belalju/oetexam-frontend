import { AfterViewInit, Component, ElementRef, inject, NgZone, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { GoogleIdentity } from '../../services/google-identity';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements AfterViewInit {
  private fb = inject(FormBuilder);
  private googleIdentity = inject(GoogleIdentity);
  private zone = inject(NgZone);
  protected auth = inject(Auth);

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLElement>;

  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  registeredEmail = signal<string | null>(null);
  resendSent = signal(false);

  professions = [
    'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist',
    'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Other'
  ];

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(1)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]],
    profession:['', Validators.required]
  });

  get firstName()  { return this.form.get('firstName')!; }
  get lastName()   { return this.form.get('lastName')!; }
  get email()      { return this.form.get('email')!; }
  get password()   { return this.form.get('password')!; }
  get profession() { return this.form.get('profession')!; }

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
    this.auth.register(this.form.value as any).subscribe({
      next: (res) => this.registeredEmail.set(res.data.email),
      error: (err) => {
        toast.error(
          err?.error?.error || 'Registration failed. Please try again.'
        );
        this.errorMessage.set(
          err?.error?.error || 'Registration failed. Please try again.'
        );
      }
    });
  }

  onResend() {
    const email = this.registeredEmail();
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
