import { Component, inject, signal } from '@angular/core';
import { TestService } from '../../services/test-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-catalog',
  imports: [CommonModule],
  templateUrl: './test-catalog.html',
  styleUrl: './test-catalog.css',
})
export class TestCatalog {
  private testService = inject(TestService);
  private router = inject(Router);

  tests = signal<any[]>([]);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  ngOnInit() {
    this.loadTests();          
  }


  loadTests() {
    this.testService.getTests({
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

  startTest(id:number) {
    this.router.navigate(['/student/test'], {
      state: { 
        testId: id,
      }
    });
  }

}
