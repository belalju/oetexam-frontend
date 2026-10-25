import { Component, computed, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Auth } from '../../../auth/services/auth';
import { COUNTRIES } from '../../../auth/models/countries';
import { CurrencyService } from '../../services/currency';
import { PaymentService } from '../../services/payment';
import { findPackage, PricingPackage } from '../../models/package';

// Optional leading +, digits with spaces/dashes in between, 7-15 digits in total.
const phoneValidator: ValidatorFn = (control) => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  const valid = /^\+?[0-9][0-9\s-]*$/.test(value) && digits.length >= 7 && digits.length <= 15;
  return valid ? null : { phone: true };
};

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  standalone: true
})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private payments = inject(PaymentService);
  protected auth = inject(Auth);
  cur = inject(CurrencyService);

  @ViewChild('countryWrapper') countryWrapper?: ElementRef<HTMLElement>;

  countries = COUNTRIES;
  countryDropdownOpen = signal(false);
  countrySearch = signal('');
  filteredCountries = computed(() => {
    const q = this.countrySearch().trim().toLowerCase();
    return q ? this.countries.filter((c) => c.toLowerCase().includes(q)) : this.countries;
  });
  pkg = signal<PricingPackage | undefined>(undefined);
  submitting = signal(false);

  savings = computed(() => {
    const p = this.pkg();
    return p ? p.originalPrice - p.price : 0;
  });
  discountPercent = computed(() => {
    const p = this.pkg();
    return p ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  });

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     ['', [Validators.required, phoneValidator]],
    country:   ['', Validators.required],
    address:   ['', [Validators.required, Validators.minLength(5)]],
    agreeTerms: [false, Validators.requiredTrue],
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const pkg = findPackage(params.get('packageId'));
      if (!pkg) {
        this.router.navigate(['/'], { fragment: 'pricing' });
        return;
      }
      this.pkg.set(pkg);
    });

    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
      });
    }
  }

  toggleCountryDropdown() {
    this.countryDropdownOpen.update((open) => !open);
    if (!this.countryDropdownOpen()) {
      this.form.get('country')!.markAsTouched();
    }
  }

  selectCountry(country: string) {
    this.form.patchValue({ country });
    this.closeCountryDropdown();
  }

  onCountrySearch(event: Event) {
    this.countrySearch.set((event.target as HTMLInputElement).value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.countryDropdownOpen() &&
      !this.countryWrapper?.nativeElement.contains(event.target as Node)
    ) {
      this.closeCountryDropdown();
    }
  }

  private closeCountryDropdown() {
    this.countryDropdownOpen.set(false);
    this.countrySearch.set('');
    this.form.get('country')!.markAsTouched();
  }

  invalid(name: string) {
    const control = this.form.get(name)!;
    return control.invalid && control.touched;
  }

  onSubmit() {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.error('Please complete the required fields.');
      return;
    }
    console.log(this.form.value.email);
    console.log(this.form.value.phone);
    console.log(this.form.value.country);
    console.log(this.form.value.address);

    // The backend reads the payer from the JWT, so a guest must log in first.
    if (!this.auth.isAuthenticated()) {
      toast.info('Please log in to complete your purchase.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const pkg = this.pkg()!;
    const v = this.form.getRawValue();
    this.submitting.set(true);

    // Charged in the package's own currency (USD); SSLCommerz converts it for local cards.
    this.payments.createSession({
      packageId: pkg.id,
      amount: pkg.price,
      currency: pkg.currency,
      customerName: `${v.firstName} ${v.lastName}`.trim().slice(0, 50),
      customerPhone: v.phone!.replace(/[\s-]/g, ''),
      customerAddress: "",
      customerCity: "",
      customerPostcode: "",
      customerCountry: v.country!,
    }).subscribe({
      next: (session) => window.location.assign(session.gatewayPageUrl),
      error: (err) => {
        this.submitting.set(false);
        toast.error(err.error?.error || err.error?.message || 'Could not start the payment. Please try again.');
      },
    });
  }
}
