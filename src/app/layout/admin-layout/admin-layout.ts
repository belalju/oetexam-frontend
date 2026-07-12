import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLinkActive, RouterLink, CommonModule, EditorModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private authService = inject(Auth);

  isProfileMenuOpen = false;
  user:any;

  ngOnInit(){
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
