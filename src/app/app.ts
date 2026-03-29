import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Ielts');

  constructor(private router: Router) {}

  isAuthPage(): boolean {
    return this.router.url.includes('login') || this.router.url.includes('registration');
  }
}
