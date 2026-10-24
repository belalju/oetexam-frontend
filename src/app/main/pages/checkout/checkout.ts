import { Component, computed, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Auth } from '../../../auth/services/auth';
import { COUNTRIES } from '../../../auth/models/countries';
import { CurrencyService } from '../../services/currency';
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
})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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

    // TODO: Create the order on the backend, then redirect to the SSLCommerz
    // GatewayPageURL returned by the payment init API.
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      toast.info('Payment gateway is not connected yet. Your order details are ready to submit.');
    }, 800);
  }
}
