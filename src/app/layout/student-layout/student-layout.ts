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
  user: any;
  
  ngOnInit() {
    this.user = this.authService.currentUser();
  }

  logout() {
    this.authService.logout();
  }


}
