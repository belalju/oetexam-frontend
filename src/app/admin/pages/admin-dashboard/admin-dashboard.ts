import { Component, inject, OnInit, signal } from '@angular/core';
import { TestService } from '../../services/test';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-admin-dashboard',
  standalone:true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit{
  private testService = inject(TestService);
  private datePipe = inject(DatePipe);
  private router = inject(Router);

  // tests:any = [];
  tests = signal<any[]>([]);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(1);
  totalPages = signal(0);

  displayedColumns: string[] = ['id', 'title', 'subTestType', 'timeLimit', 'published', 'createdBy'];


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

  onPageChange(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadTests();
  }

  formatDate(dateStr: string): string {
    return this.datePipe.transform(dateStr, 'MMM d, y') || dateStr;
  }

  getTypeBadge(test: any) {
    const type = test.subTestType.toUpperCase();
    if (type === 'READING') return { color: 'bg-indigo-100 text-blue-700', label: 'Reading' };
    if (type === 'LISTENING') return { color: 'bg-teal-100 text-green-700', label: 'Listening' };
    if (type === 'WRITING') return { color: 'bg-purple-100 text-purple-700', label: 'Writing' };
    if (type === 'SPEAKING') return { color: 'bg-rose-100 text-rose-700', label: 'Speaking' };
    return { color: 'bg-gray-100 text-gray-700', label: test.subTestType };
  }

  getStatusBadge(published: boolean) {
    return published 
      ? { color: 'bg-emerald-100 text-green-700', label: 'Published' }
      : { color: 'bg-yellow-100 text-yellow-700', label: 'Draft' };
  }

  getEndIndex(): number {
    const end = (this.currentPage() + 1) * this.pageSize();
    return Math.min(end, this.totalElements());
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();

    let start = Math.max(0, this.currentPage() - 3);
    let end = Math.min(total - 1, this.currentPage() + 3);

    if (start === 0) {
      end = Math.min(6, total - 1);
    }
    if (end === total - 1) {
      start = Math.max(0, total - 7);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  editTest(id:number) {
    this.router.navigate(['/admin/create-test'], {
      state: { 
        testId: id,
      }
    });
    console.log("Routing");
  }
}
