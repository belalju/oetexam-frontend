import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../auth/services/auth';
import { CurrencyService } from '../../main/services/currency';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private authService = inject(Auth);
  currency = inject(CurrencyService);
  currencyOpen = signal(false);
  isAuthenticated = this.authService.isAuthenticated();
  isAdmin = this.authService.isAdmin();
  
  // Mobile menu state
  mobileMenuOpen = signal(false);
  showDropdown = signal<string | null>(null);
  
  selectCurrency(code: string) {
    this.currency.select(code);
    this.currencyOpen.set(false);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }
  
  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
    this.showDropdown.set(null);
  }
  
  toggleDropdown(menu: string) {
    this.showDropdown.update(current => current === menu ? null : menu);
  }
}
