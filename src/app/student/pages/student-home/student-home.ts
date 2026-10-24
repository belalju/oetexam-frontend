import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TestService } from '../../services/test-service';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

type TestTypeFilter = 'ALL' | 'READING' | 'LISTENING';

interface StudentTest {
  id: number;
  title: string;
  subTestType: string;
}

@Component({
  selector: 'app-student-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './student-home.html',
  styleUrl: './student-home.css',
})
export class StudentHome implements OnInit {
  private testService = inject(TestService);
  private router = inject(Router);

  tests = signal<StudentTest[]>([]);
  loaded = signal(false);
  loadingMore = signal(false);
  searchTerm = signal('');
  typeFilter = signal<TestTypeFilter>('ALL');
  isReadingOpen = signal(true);
  isListeningOpen = signal(false);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(12);
  totalPages = signal(0);

  // Server paginates and filters; this re-check keeps the list correct if the API ignores a filter.
  filteredTests = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();

    return this.tests().filter((test) => {
      const matchesSearch = !search || test.title.toLowerCase().includes(search);
      const matchesType = type === 'ALL' || test.subTestType === type;

      return matchesSearch && matchesType;
    });
  });
  hasMore = computed(() => this.currentPage() + 1 < this.totalPages());

  private search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.reload();
      });
  }

  ngOnInit() {
    this.loadTests();
  }

  private reload() {
    this.currentPage.set(0);
    this.loadTests();
  }

  loadTests() {
    const append = this.currentPage() > 0;
    this.loadingMore.set(append);
    this.testService.getTests({
      page: this.currentPage(),
      size: this.pageSize(),
      search: this.searchTerm().trim() || undefined,
      testType: this.typeFilter() === 'ALL' ? undefined : this.typeFilter(),
    }).subscribe({
      next: (response: any) => {
        const page: StudentTest[] = response.data.content || [];
        this.tests.update((current) => (append ? [...current, ...page] : page));
        this.totalElements.set(response.data.totalElements || 0);
        this.totalPages.set(response.data.totalPages || 0);
        this.loaded.set(true);
        this.loadingMore.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.loadingMore.set(false);
        if (append) this.currentPage.update((p) => p - 1);
      },
    });
  }

  loadMore() {
    if (this.loadingMore() || !this.hasMore()) return;
    this.currentPage.update((p) => p + 1);
    this.loadTests();
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.search$.next(input.value);
  }

  setTypeFilter(type: TestTypeFilter) {
    if (type === this.typeFilter()) return;
    this.typeFilter.set(type);
    this.reload();
  }

  toggleReading() {
    this.isReadingOpen.update((isOpen) => !isOpen);
  }

  toggleListening() {
    this.isListeningOpen.update((isOpen) => !isOpen);
  }

  startTest(id: number) {
    this.router.navigate(['/student/test'], {
      state: {
        testId: id,
      },
    });
  }
}
