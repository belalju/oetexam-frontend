import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService } from '../../services/test-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

type TestTypeFilter = 'ALL' | 'READING' | 'LISTENING';
type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED';

@Component({
  selector: 'app-my-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-history.html',
  styleUrl: './my-history.css',
})
export class MyHistory {
  private testService = inject(TestService);
  private router = inject(Router);

  private readonly dhakaTimeZone = 'Asia/Dhaka';

  tests = signal<any[]>([]);
  searchTerm = signal('');
  selectedType = signal<TestTypeFilter>('ALL');
  selectedStatus = signal<StatusFilter>('ALL');

  typeFilters: { label: string; value: TestTypeFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Reading', value: 'READING' },
    { label: 'Listening', value: 'LISTENING' },
  ];

  statusFilters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  filteredTests = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const type = this.selectedType();
    const status = this.selectedStatus();

    return this.tests().filter((item) => {
      const itemType = String(item.subTestType || '').toUpperCase();
      const itemStatus = String(item.status || '').toUpperCase();
      const title = String(item.testTitle || '').toLowerCase();
      const attemptId = String(item.attemptId || '').toLowerCase();

      const matchesSearch = !search || title.includes(search) || attemptId.includes(search);
      const matchesType = type === 'ALL' || itemType === type;
      const matchesStatus = status === 'ALL' || itemStatus === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  });

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

  getScorePercentage(item: any): number {
    const totalScore = Number(item?.totalScore) || 0;
    const maxScore = Number(item?.maxScore) || 0;

    if (maxScore <= 0) return 0;

    return Math.round((totalScore / maxScore) * 100);
  }

  setSearchTerm(value: string) {
    this.searchTerm.set(value);
  }

  setSelectedType(value: TestTypeFilter) {
    this.selectedType.set(value);
  }

  setSelectedStatus(value: StatusFilter) {
    this.selectedStatus.set(value);
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
