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

  private readonly dhakaTimeZone = 'Asia/Dhaka';

  results = signal<any>({});
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  ngOnInit() {
    const state = history.state as any;
    if (state?.attemptId) {
      this.getResults(state.attemptId as number);
    }

    this.animateProgress();
  }

  formatDhaka(dateInput: unknown, options: Intl.DateTimeFormatOptions): string {
    if (dateInput === null || dateInput === undefined) return '';

    // If backend sends an ISO string WITHOUT timezone info (no 'Z' or +/-hh:mm),
    // JS treats it as "local time". We want to treat it as UTC before converting.
    const input = dateInput as unknown;
    const asString = typeof input === 'string' ? input : null;

    let d: Date;
    if (asString) {
      const hasTimeZone =
        /Z$/i.test(asString) || /[+-]\d{2}:\d{2}$/.test(asString);
      const utcLike = hasTimeZone ? asString : `${asString}Z`;
      d = new Date(utcLike);
    } else {
      d = new Date(input as any);
    }

    if (Number.isNaN(d.getTime())) return '';

    return new Intl.DateTimeFormat('en-GB', {
      timeZone: this.dhakaTimeZone,
      ...options,
    }).format(d);
  }

  private getDhakaParts(dateInput: unknown) {
    const asDate = (() => {
      if (dateInput === null || dateInput === undefined) return null;
      const input = dateInput as unknown;
      const asString = typeof input === 'string' ? input : null;

      let d: Date;
      if (asString) {
        const hasTimeZone = /Z$/i.test(asString) || /[+-]\d{2}:\d{2}$/.test(asString);
        const utcLike = hasTimeZone ? asString : `${asString}Z`;
        d = new Date(utcLike);
      } else {
        d = new Date(input as any);
      }
      if (Number.isNaN(d.getTime())) return null;
      return d;
    })();

    if (!asDate) {
      return null;
    }

    // Use en-GB + Asia/Dhaka and then compose the output ourselves.
    const dtf = new Intl.DateTimeFormat('en-GB', {
      timeZone: this.dhakaTimeZone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const parts = dtf.formatToParts(asDate);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

    return {
      day: get('day'),
      month: get('month'),
      year: get('year'),
      hour: get('hour'),
      minute: get('minute'),
      dayPeriod: get('dayPeriod'), // "AM"/"PM"
    };
  }

  formatDhakaDateTimeDhakaStyle(dateInput: unknown): string {
    const parts = this.getDhakaParts(dateInput);
    if (!parts) return '';
    // 12-05-2026 12:43 AM
    return `${parts.day}-${parts.month}-${parts.year} ${parts.hour}:${parts.minute} ${parts.dayPeriod}`.trim();
  }

  formatSecondsToMmSs(secondsInput: unknown): string {
    if (secondsInput === null || secondsInput === undefined) return '';
    const totalSeconds = typeof secondsInput === 'number' ? secondsInput : Number(secondsInput);
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '00:00';

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${mm}:${ss}`;
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


  activeFilter: 'all' | 'correct' | 'wrong' = 'all';

  get totalQuestions(): number {
    return this.results().answers?.length || 0;
  }

  get correctCount(): number {
    return this.results().answers?.filter((a: any) => a.correct).length || 0;
  }

  get wrongCount(): number {
    return this.results().answers?.filter((a: any) => !a.correct).length || 0;
  }

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
