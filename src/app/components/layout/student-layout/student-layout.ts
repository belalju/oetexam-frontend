import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-student-layout',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive],
  templateUrl: './student-layout.html',
  styleUrl: './student-layout.css',
})
export class StudentLayout {

}
