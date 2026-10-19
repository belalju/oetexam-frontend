import { Injectable, computed, signal } from '@angular/core';

export interface CurrencyOption {
  code: string;
  symbol: string;
  country: string;
  flag: string; 
  rate: number;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', country: 'USA', flag: 'us', rate: 1 },
  { code: 'BDT', symbol: '৳', country: 'Bangladesh', flag: 'bd', rate: 122 },
  { code: 'INR', symbol: '₹', country: 'India', flag: 'in', rate: 83 },
  { code: 'NPR', symbol: 'Rs', country: 'Nepal', flag: 'np', rate: 133 },
  { code: 'LKR', symbol: 'Rs', country: 'Sri Lanka', flag: 'lk', rate: 300 },
  { code: 'PKR', symbol: 'Rs', country: 'Pakistan', flag: 'pk', rate: 280 },
  { code: 'PHP', symbol: '₱', country: 'Philippines', flag: 'ph', rate: 57 },
];

const STORAGE_KEY = 'currency';
const RATES_KEY = 'currency-rates';
const RATES_URL = 'https://open.er-api.com/v6/latest/USD';
const RATES_TTL_MS = 12 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  readonly options = CURRENCIES;
  private readonly _code = signal(this.load());

  private readonly rates = signal<Record<string, number>>(
    Object.fromEntries(CURRENCIES.map((c) => [c.code, c.rate])),
  );

  readonly code = this._code.asReadonly();
  readonly current = computed(
    () => CURRENCIES.find((c) => c.code === this._code()) ?? CURRENCIES[0],
  );

  constructor() {
    this.loadRates();
  }

  select(code: string) {
    if (!CURRENCIES.some((c) => c.code === code)) return;
    this._code.set(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  }

  format(usd: number): string {
    const c = this.current();
    const value = usd * (this.rates()[c.code] ?? c.rate);
    if (c.code === 'USD') return `${c.symbol}${value.toFixed(2)}`;
    return `${c.symbol}${Math.round(value).toLocaleString('en-US')}`;
  }

  private async loadRates() {
    try {
      const cached = JSON.parse(localStorage.getItem(RATES_KEY) ?? 'null');
      if (cached?.rates) {
        this.applyRates(cached.rates);
        if (Date.now() - cached.at < RATES_TTL_MS) return;
      }
    } catch {}
    try {
      const res = await fetch(RATES_URL);
      const data = await res.json();
      if (data?.result !== 'success' || !data.rates) return;
      this.applyRates(data.rates);
      try {
        localStorage.setItem(RATES_KEY, JSON.stringify({ at: Date.now(), rates: data.rates }));
      } catch {}
    } catch {
      
    }
  }

  private applyRates(api: Record<string, number>) {
    const next = { ...this.rates() };
    for (const c of CURRENCIES) {
      if (typeof api[c.code] === 'number' && api[c.code] > 0) next[c.code] = api[c.code];
    }
    this.rates.set(next);
  }

  private load(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CURRENCIES.some((c) => c.code === saved)) return saved;
    } catch {}
    return 'USD';
  }
}
