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

  tests = signal<any[]>([]);
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
        this.tests.set(response.data.content || []);        // ✅ Use .set()
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
