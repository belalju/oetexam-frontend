import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-student-layout',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive],
  templateUrl: './student-layout.html',
  styleUrl: './student-layout.css',
})
export class StudentLayout {
  private authService = inject(Auth);

  logout() {
    this.authService.logout();
  }
}
