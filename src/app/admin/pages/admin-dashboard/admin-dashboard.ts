import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TestService } from '../../services/test';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-admin-dashboard',
  standalone:true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit, OnDestroy{
  private testService = inject(TestService);
  private datePipe = inject(DatePipe);
  private router = inject(Router);

  testTypeTabs = [
    { value: 'ALL', label: 'All' },
    { value: 'READING', label: 'Reading' },
    { value: 'LISTENING', label: 'Listening' },
  ] as const;
  activeType = signal<'ALL' | 'READING' | 'LISTENING'>('ALL');
  searchQuery = signal('');
  searchInputValue = '';
  private searchSubject = new Subject<string>();
  private searchSubscription = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe((query) => {
    this.searchInputValue = query;
    this.searchQuery.set(query);
    this.currentPage.set(0);
    this.loadTests();
  });

  // One page of tests from the server; search, type filter and paging all happen there.
  rawTests = signal<any[]>([]);
  filteredTests = this.rawTests;
  totalElements = signal(0);
  totalPages = signal(1);
  currentPage = signal(0);
  pageSize = signal(10);

  displayedColumns: string[] = ['id', 'title', 'subTestType', 'timeLimit', 'published', 'createdBy'];


  ngOnInit() {
    this.loadTests();          
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }


  loadTests() {
    const type = this.activeType();
    this.testService.getTests({
      page: this.currentPage(),
      size: this.pageSize(),
      search: this.searchQuery().trim() || undefined,
      testType: type === 'ALL' ? undefined : type,
    }).subscribe({
      next: (response:any) => {
        this.rawTests.set(response.data?.content || []);
        this.totalElements.set(response.data?.totalElements || 0);
        this.totalPages.set(Math.max(1, response.data?.totalPages || 1));
      },
      error: (err:any) => {
        console.error(err);
        this.rawTests.set([]);
        this.totalElements.set(0);
        this.totalPages.set(1);
      }
    });
  }

  publishTest(id:number) {
    // Call the API to publish the test
    this.testService.publishTest(id).subscribe({
      next: (response:any) => {
        this.loadTests();
        toast.success('Test published successfully!');
      },
      error: (err:any) => {
        console.error(err);
        toast.error('Failed to publish test.');
      }
    });
  }

  unPublishTest(id:number) {
    // Call the API to unpublish the test
    this.testService.unPublishTest(id).subscribe({
      next: (response:any) => {
        this.loadTests();
        toast.warning('Test unpublished successfully!');
      },
      error: (err:any) => {
        console.error(err);
        toast.error('Failed to unpublish test.');
      }
    });
  }

  totalTests(): number {
    return this.totalElements();
  }

  publishedTests(): number {
    return this.rawTests().filter(test => test.published).length;
  }

  draftTests(): number {
    return this.rawTests().filter(test => !test.published).length;
  }

  onPageChange(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadTests();
  }

  setType(type: 'ALL' | 'READING' | 'LISTENING'): void {
    this.activeType.set(type);
    this.currentPage.set(0);
    this.loadTests();
  }

  queueSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchInputValue = '';
    this.searchQuery.set('');
    this.currentPage.set(0);
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

  // 1 2 3 … 9 style list: first, last, and a window around the current page.
  getPageItems(): (number | null)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    const items: (number | null)[] = [0];
    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);
    if (start > 1) items.push(null);
    for (let i = start; i <= end; i++) items.push(i);
    if (end < total - 2) items.push(null);
    items.push(total - 1);
    return items;
  }

  editTest(id:number) {
    this.router.navigate(['/admin/create-test'], {
      state: { 
        testId: id,
      }
    });
  }
}
