import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
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
  isProfileMenuOpen = false;
  
  ngOnInit() {
    this.user = this.authService.currentUser();
  }

  logout() {
    this.authService.logout();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.profile-menu')) {
      this.isProfileMenuOpen = false;
    }
  }


}
