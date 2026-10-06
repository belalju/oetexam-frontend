import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Auth } from '../../../auth/services/auth';
import { COUNTRIES } from '../../../auth/models/countries';
import { findPackage, PricingPackage } from '../../models/package';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected auth = inject(Auth);

  countries = COUNTRIES;
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
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,20}$/)]],
    country:   ['', Validators.required],
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
      this.form.patchValue({ firstName: user.firstName, lastName: user.lastName, email: user.email });
    }
  }

  invalid(name: string) {
    const control = this.form.get(name)!;
    return control.invalid && control.touched;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.error('Please complete the required fields.');
      return;
    }

    // TODO: Create the order on the backend, then redirect to the SSLCommerz
    // GatewayPageURL returned by the payment init API.
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      toast.info('Payment gateway is not connected yet. Your order details are ready to submit.');
    }, 800);
  }
}
