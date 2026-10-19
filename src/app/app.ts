import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Ielts');

  private doc = inject(DOCUMENT);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.setCanonical(e.urlAfterRedirects));
  }

  private setCanonical(url: string) {
    const path = url.split(/[?#]/)[0];
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = `https://oetpractice.org${path === '/' ? '/' : path.replace(/\/$/, '')}`;
  }

  isAuthPage(): boolean {
    return this.router.url.includes('login') || this.router.url.includes('registration');
  }
}
