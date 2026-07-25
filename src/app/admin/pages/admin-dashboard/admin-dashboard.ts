import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { forkJoin, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
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
  private apiPageSize = 100;
  private searchSubscription = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe((query) => {
    this.searchInputValue = query;
    this.searchQuery.set(query);
    this.currentPage.set(0);
  });

  // tests:any = [];
  rawTests = signal<any[]>([]);
  filteredTests = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const selectedType = this.activeType();

    return this.rawTests().filter((test) => {
      const testType = String(test.subTestType ?? '').toUpperCase();
      const matchesType = selectedType === 'ALL' || testType === selectedType;
      const matchesSearch = !query || String(test.title ?? '').toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  });
  totalElements = computed(() => this.filteredTests().length);
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredTests().length / this.pageSize())));

  displayedColumns: string[] = ['id', 'title', 'subTestType', 'timeLimit', 'published', 'createdBy'];


  ngOnInit() {
    this.loadTests();          
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }


  loadTests() {
    this.testService.getTests({
      page: 0,
      size: this.apiPageSize
    }).subscribe({
      next: (response:any) => {
        const firstPage = response.data?.content || [];
        const totalPages = response.data?.totalPages || 1;

        if (totalPages <= 1) {
          this.rawTests.set(firstPage);
          return;
        }

        forkJoin(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            this.testService.getTests({
              page: index + 1,
              size: this.apiPageSize
            })
          )
        ).subscribe({
          next: (pages:any[]) => {
            const allTests = [
              ...firstPage,
              ...pages.flatMap((page:any) => page.data?.content || [])
            ];

            this.rawTests.set(allTests);
          },
          error: (err:any) => {
            console.error(err);
            this.rawTests.set(firstPage);
          }
        });
      },
      error: (err:any) => {
        console.error(err);
        this.rawTests.set([]);
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
    return this.rawTests().length;
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
  }

  setType(type: 'ALL' | 'READING' | 'LISTENING'): void {
    this.activeType.set(type);
    this.currentPage.set(0);
  }

  queueSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchInputValue = '';
    this.searchQuery.set('');
    this.currentPage.set(0);
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
  }
}
