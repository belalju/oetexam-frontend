import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TestService } from '../../services/test-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type TestTypeFilter = 'ALL' | 'READING' | 'LISTENING';

interface StudentTest {
  id: number;
  title: string;
  subTestType: string;
}

@Component({
  selector: 'app-student-home',
  imports: [CommonModule],
  templateUrl: './student-home.html',
  styleUrl: './student-home.css',
})
export class StudentHome implements OnInit {
  private testService = inject(TestService);
  private router = inject(Router);

  tests = signal<StudentTest[]>([]);
  searchTerm = signal('');
  typeFilter = signal<TestTypeFilter>('ALL');
  isReadingOpen = signal(true);
  isListeningOpen = signal(false);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  filteredTests = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();

    return this.tests().filter((test) => {
      const matchesSearch = !search || test.title.toLowerCase().includes(search);
      const matchesType = type === 'ALL' || test.subTestType === type;

      return matchesSearch && matchesType;
    });
  });

  ngOnInit() {
    this.loadTests();
  }

  loadTests() {
    this.testService.getTests({
      page: this.currentPage(),
      size: this.pageSize(),
    }).subscribe({
      next: (response: any) => {
        this.tests.set(response.data.content || []);
        this.totalElements.set(response.data.totalElements || 0);
        this.totalPages.set(response.data.totalPages || 0);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  setTypeFilter(type: TestTypeFilter) {
    this.typeFilter.set(type);
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
