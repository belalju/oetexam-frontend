import { AfterViewInit, ChangeDetectorRef, Component, computed, DOCUMENT, ElementRef, inject, Inject, OnDestroy, OnInit, signal, Signal, ViewChild } from '@angular/core';
import { TestService } from '../../services/test-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';



@Component({
  selector: 'app-test',
  imports: [CommonModule],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test implements AfterViewInit, OnDestroy { 
  @ViewChild('testUI') testElement!: ElementRef;
  currentStep: '1' | '2' | '3' = '1'; 
  activeQuestion: number = 1;
  currentQuestion: number = 1;
  isFullScreen: boolean = true;
  countdownDisplay: string = '00:00:00';
  private timeLeftInSeconds: number = 0;
  private timerInterval: any = null;
  isCountdownRunning: boolean = false;
  sectionTimeExpired = signal<boolean>(false);  // Track if current section time has expired
 

  testId: number | null = null;
  testData = signal<any | null>(null);
  attemptData = signal<any | null>(null);

  
  private cdr = inject(ChangeDetectorRef);
  private testService = inject(TestService);
  private router = inject(Router);

  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  ngAfterViewInit() {
    const minutes = this.getSectionTimeLimit();
    this.timeLeftInSeconds = minutes * 60;

    this.startCountdown();
    this.updateDisplay();   

    setTimeout(() => {
      this.enterFullScreen();
    }, 100);
  }

  ngOnInit() {
    const state = history.state as any;

    if (state?.testId) {
      this.testId = state.testId;
      this.testById(state.testId as number); 
    }

  }



  // ===================== COMPUTED PROPERTIES FOR PART A =====================
  partA = computed(() => {
    const data = this.testData();
    if (!data) return null;
    return data.parts?.find((p: any) => p.partLabel === 'PART_A') ?? null;
  });

  partAPassages = computed(() => this.partA()?.passages ?? []);
  partAGroups = computed(() => this.partA()?.questionGroups ?? []);


  partAQuestionCount = computed(() =>
    this.partAGroups().reduce((total: number, g: any) => total + (g.questions?.length ?? 0), 0)
  );

  // ===================== COMPUTED PROPERTIES FOR PART B & C =====================
  partB = computed(() => {
    const data = this.testData();
    if (!data) return null;
    return data.parts?.find((p: any) => p.partLabel === 'PART_B') ?? null;
  });

  partC = computed(() => {
    const data = this.testData();
    if (!data) return null;
    return data.parts?.find((p: any) => p.partLabel === 'PART_C') ?? null;
  });

  partBPassages = computed(() => this.partB()?.passages ?? []);
  partCPassages = computed(() => this.partC()?.passages ?? []);

  getPassageBById = (id: number) => this.partBPassages().find((p: any) => p.id === id);
  getPassageCById = (id: number) => this.partCPassages().find((p: any) => p.id === id);

  partBGroups = computed(() => this.partB()?.questionGroups ?? []);
  partCGroups = computed(() => this.partC()?.questionGroups ?? []);

  partBCQuestionCount = computed(() => {
    const bCount = this.partBGroups().reduce((t: number, g: any) => t + (g.questions?.length ?? 0), 0);
    const cCount = this.partCGroups().reduce((t: number, g: any) => t + (g.questions?.length ?? 0), 0);
    return bCount + cCount;
  });


  // Signal to track all answers: { [questionId]: selectedValue }
  answers = signal<Record<number, { answerText: string; selectedOptionId: number | null }>>({});

  
  getQuestionsForGroup(groupId: number) {
    const group = this.partAGroups().find((g: any) => g.id === groupId);
    return group?.questions ?? [];
  }

  // Get section-specific time limit based on currentStep
  getSectionTimeLimit(): number {
    if (this.currentStep === '2') {
      return this.partA()?.timeLimitMinutes || 60;
    } else if (this.currentStep === '3') {
      const partBTime = this.partB()?.timeLimitMinutes || 0;
      const partCTime = this.partC()?.timeLimitMinutes || 0;
      return partBTime + partCTime || 60;
    }
    // Section 1 (Introduction) doesn't need a specific timer
    return this.testData()?.totalTimeLimitMinutes || 60;
  }

  selectAnswer(questionId: number, value: string, optionId: number | null = null) {
    // Update local state immediately for UI feedback
    this.answers.update(current => ({
      ...current,
      [questionId]: { answerText: value, selectedOptionId: optionId }
    }));
    
    // Save to backend
    const payload = {
      questionId: Number(questionId),
      answerText: value,
      selectedOptionId: optionId
    };
    this.saveAnswers(payload);
  }

  isSelected(questionId: number, value: string): boolean {
    return this.answers()[questionId]?.answerText === value;
  }

  saveAnswers(payload: any) {
    const attemptId = this.attemptData()?.attemptId;

    this.testService.saveAnswer(attemptId, payload).subscribe({
      next: () => {
        toast.success('Answers saved successfully!');
      },
      error: (err) => {
        console.error('Failed to save answers:', err);
        toast.error('Failed to save answers. Please try again later.');
      }
    });
  }

  startAttempt() {
    if (!this.testId) return;

    this.testService.startAttempt(this.testId).subscribe({
      next: (response: any) => {
        const attemptId = response.data.attemptId;
        this.attemptData.set(response.data);
        toast.success('Test started successfully!');
        // this.router.navigate(['/student/attempt', attemptId]);
        localStorage.setItem('currentAttemptId', attemptId.toString());
      },
      error: (err) => {
        console.error('Failed to start attempt:', err);
        toast.error('Failed to start the test. Please try again later.');
      }
    });
  }

  attemptById(attemptId: number) {
    this.testService.attemptById(attemptId).subscribe({
      next: (response: any) => {
        this.attemptData.set(response.data);
        attemptId = response.data.attemptId;
      },
      error: (err) => {
        console.error('Failed to fetch attempt data:', err);
        toast.error('Failed to load attempt data. Please try again later.');
      }
    });
  }

  submitAttempt() {
    const attemptIdFromData = this.attemptData()?.attemptId;
    const attemptIdFromStorage = localStorage.getItem('currentAttemptId');

    // Determine which attemptId to use
    let attemptId: number | null = null;

    if (attemptIdFromData) {
      attemptId = attemptIdFromData;
    } else if (attemptIdFromStorage) {
      attemptId = parseInt(attemptIdFromStorage, 10);
    }

    // Validation
    if (!attemptId || isNaN(attemptId)) {
      toast.error('No active attempt found to submit.');
      return;
    }

    this.testService.submitAttempt(attemptId).subscribe({
      next: () => {
        toast.success('Test submitted successfully!');
        localStorage.removeItem('currentAttemptId');
        // this.router.navigate(['/student/test-results', attemptId]);
        this.router.navigate(['/student/my-history']);
      },
      error: (err) => {
        console.error('Failed to submit attempt:', err);
        toast.error('Failed to submit the test. Please try again later.');
      }
    });
  }



  testById(id:number){
    this.testService.testById(id).subscribe({
        next: (response:any) => {
          const data = response.data;
          this.testData.set(data);
        }
      });
  }

  startCountdown() {
    if (this.isCountdownRunning) return;

    this.isCountdownRunning = true;
    this.sectionTimeExpired.set(false);

    this.timerInterval = setInterval(() => {
      if (this.timeLeftInSeconds > 0) {
        this.timeLeftInSeconds--;
        this.updateDisplay();
      } else {
        this.timeUp();
      }
    }, 1000);
  }

  // ===================== UPDATE DISPLAY (HH:MM:SS) =====================
  private updateDisplay() {
    const hours = Math.floor(this.timeLeftInSeconds / 3600);
    const minutes = Math.floor((this.timeLeftInSeconds % 3600) / 60);
    const seconds = this.timeLeftInSeconds % 60;

    this.countdownDisplay = 
      `${hours.toString().padStart(2, '0')}:` +
      `${minutes.toString().padStart(2, '0')}:` +
      `${seconds.toString().padStart(2, '0')}`;
    this.cdr.detectChanges();
  }

  private timeUp() {
    this.stopCountdown();
    this.countdownDisplay = '00:00:00';
    this.sectionTimeExpired.set(true);
    alert(`Time is up for ${this.currentStep === '2' ? 'Part A' : this.currentStep === '3' ? 'Part B & C' : 'this section'}!`);
  }

  stopCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isCountdownRunning = false;
  }

  ngOnDestroy() {
    this.stopCountdown();
    this.exitFullScreen();
  }



  enterFullScreen() {
    this.isFullScreen = true;
    const elem = this.testElement.nativeElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

  
  exitFullScreen() {
    this.isFullScreen = false;
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    }
  }

  goNext() { 
    if (this.currentStep === '1') {
      this.currentStep = '2';
      this.resetSectionTimer();

      const currentAttemptId = localStorage.getItem('currentAttemptId');
      console.log('Current Attempt ID from localStorage:', currentAttemptId);
      if (!this.attemptData() && currentAttemptId) {
        this.attemptById(parseInt(currentAttemptId));
      } else if (!this.attemptData()) {
        this.startAttempt();
      }

    } else if (this.currentStep === '2') {
      // Can only move to section 3 if Part A time has expired
      if (!this.sectionTimeExpired()) {
        toast.error('You must complete Part A time limit before proceeding to Part B & C');
        return;
      }
      this.currentStep = '3';
      this.resetSectionTimer();
    }
  }

  goBack() { 
    if (this.currentStep === '3') {
      // Cannot go back from section 3 (Part B & C)
      toast.error('You cannot go back to Part A after starting Part B & C');
      return;
    } else if (this.currentStep === '2') {
      // Can go back from section 2 if Part A time hasn't expired or if not started
      if (this.sectionTimeExpired()) {
        toast.error('Cannot go back to Introduction after Part A time has expired');
        return;
      }
      this.currentStep = '1';
      this.resetSectionTimer();
    }
  }

  // Reset countdown timer for the new section
  private resetSectionTimer() {
    this.stopCountdown();
    const minutes = this.getSectionTimeLimit();
    this.timeLeftInSeconds = minutes * 60;
    this.startCountdown();
    this.updateDisplay();
  }
  finishSection() { console.log('Finishing...'); }

}
