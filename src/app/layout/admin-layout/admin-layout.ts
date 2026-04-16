import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLinkActive, RouterLink, CommonModule, EditorModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {

}
