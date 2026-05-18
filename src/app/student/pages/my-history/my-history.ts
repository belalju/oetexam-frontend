import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService } from '../../services/test-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-history',
  imports: [CommonModule],
  templateUrl: './my-history.html',
  styleUrl: './my-history.css',
})
export class MyHistory {
  private testService = inject(TestService);
  private router = inject(Router);

  private readonly dhakaTimeZone = 'Asia/Dhaka';

  tests = signal<any[]>([]);

  formatDhakaShort(dateInput: unknown): string {
    if (dateInput === null || dateInput === undefined) return '';

    const asString = typeof dateInput === 'string' ? dateInput : null;

    let d: Date;
    if (asString) {
      const hasTimeZone = /Z$/i.test(asString) || /[+-]\d{2}:\d{2}$/.test(asString);
      const utcLike = hasTimeZone ? asString : `${asString}Z`;
      d = new Date(utcLike);
    } else {
      d = new Date(dateInput as any);
    }

    if (Number.isNaN(d.getTime())) return '';

    // Similar to Angular date:'short' but forced to Dhaka timezone
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: this.dhakaTimeZone,
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: true,
    }).format(d);
  }
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  ngOnInit() {
    this.myHistory();          
  }


  myHistory() {
    this.testService.getMyHistory({
      page: this.currentPage(),
      size: this.pageSize()
    }).subscribe({
      next: (response:any) => {
        this.tests.set(response.data.content || []);     
        this.totalElements.set(response.data.totalElements || 0);
        this.totalPages.set(response.data.totalPages || 0);
      },
      error: (err:any) => {
        console.error(err);
      }
    });
  }

  viewResults(attemptId: number) {
    this.router.navigate(['/student/results'], {
        state: { 
          attemptId: attemptId,
        }
      });
  }
}
