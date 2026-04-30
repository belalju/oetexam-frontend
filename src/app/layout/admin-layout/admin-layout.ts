import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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

  logout() {
    this.authService.logout();
  }

  user:any;

  ngOnInit(){
    this.user = this.authService.currentUser();
  }

}
