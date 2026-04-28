import { Component, inject, OnInit, signal } from '@angular/core';
import { TestService } from '../../services/test-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results',
  imports: [CommonModule],
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results implements OnInit {
  private testService = inject(TestService);
  private router = inject(Router);

  results = signal<any>({});
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  ngOnInit() {
    const state = history.state as any;
    console.log('Received state:', state);
    if (state?.attemptId) {
      this.getResults(state.attemptId as number);
    }

    this.animateProgress();
  }

  getResults(attemptId: number) {
    this.testService.getResults(attemptId).subscribe({
      next: (response:any) => {
        this.results.set(response.data || {});        // ✅ Use .set()
      },
      error: (err:any) => {
        console.error(err);
      }
    });
  }


  filters = [
    { label: 'All (14)', value: 'all' },
    { label: 'Correct (10)', value: 'correct' },
    { label: 'Wrong (4)', value: 'wrong' }
  ];

  activeFilter: 'all' | 'correct' | 'wrong' = 'all';

  get filteredAnswers() {
    if (!this.results()) return [];
    if (this.activeFilter === 'correct') return this.results().answers.filter((a:any) => a.correct);
    if (this.activeFilter === 'wrong') return this.results().answers.filter((a:any) => !a.correct);
    return this.results().answers;
  }

  setFilter(filter: 'all' | 'correct' | 'wrong') {
    this.activeFilter = filter;
  }
  animateProgress() {
    setTimeout(() => {
      const progressBar = document.getElementById('progress');
      if (progressBar && this.results()) {
        progressBar.style.width = `${this.results().percentage}%`;
      }
    }, 300);
  }
  
}
