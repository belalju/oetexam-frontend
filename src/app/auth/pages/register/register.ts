import { AfterViewInit, Component, computed, ElementRef, HostListener, inject, NgZone, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { GoogleIdentity } from '../../services/google-identity';
import { COUNTRIES } from '../../models/countries';
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
  @ViewChild('countryWrapper') countryWrapper!: ElementRef<HTMLElement>;

  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  registeredEmail = signal<string | null>(null);
  resendSent = signal(false);

  professions = [
    'Dentistry', 'Dietetics', 'Medicine', 'Nursing', 'Occupational Therapy',
    'Optometry', 'Pharmacy', 'Physiotherapy', 'Podiatry', 'Radiography',
    'Speech Pathology', 'Veterinary Science'
  ];

  countries = COUNTRIES;
  countryDropdownOpen = signal(false);
  countrySearch = signal('');
  filteredCountries = computed(() => {
    const q = this.countrySearch().trim().toLowerCase();
    if (!q) return this.countries;
    return this.countries.filter((c) => c.toLowerCase().includes(q));
  });

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(1)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]],
    profession:['', Validators.required],
    country:   ['', Validators.required]
  });

  get firstName()  { return this.form.get('firstName')!; }
  get lastName()   { return this.form.get('lastName')!; }
  get email()      { return this.form.get('email')!; }
  get password()   { return this.form.get('password')!; }
  get profession() { return this.form.get('profession')!; }
  get country()    { return this.form.get('country')!; }

  toggleCountryDropdown() {
    this.countryDropdownOpen.update((open) => !open);
    if (!this.countryDropdownOpen()) {
      this.country.markAsTouched();
    }
  }

  selectCountry(country: string) {
    this.form.patchValue({ country });
    this.countrySearch.set('');
    this.countryDropdownOpen.set(false);
    this.country.markAsTouched();
  }

  onCountrySearch(event: Event) {
    this.countrySearch.set((event.target as HTMLInputElement).value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.countryDropdownOpen() &&
      this.countryWrapper &&
      !this.countryWrapper.nativeElement.contains(event.target as Node)
    ) {
      this.countryDropdownOpen.set(false);
      this.countrySearch.set('');
      this.country.markAsTouched();
    }
  }

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
