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
  countdownDisplay: string = '00:00:00';     // ← as you requested
  private timeLeftInSeconds: number = 0;
  private timerInterval: any = null;
  isCountdownRunning: boolean = false;
 

  testId: number | null = null;
  testData = signal<any | null>(null);
  attemptData = signal<any | null>(null);

  
  private cdr = inject(ChangeDetectorRef);
  private testService = inject(TestService);
  private router = inject(Router);

  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  ngAfterViewInit() {
    const minutes = this.testData().totalTimeLimitMinutes || 60;
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

  selectAnswer(questionId: number, value: string, optionId: number | null = null) {
    // this.answers.update(current => ({
    //   ...current,
    //   [questionId]: { answerText: value, selectedOptionId: optionId }
    // }));
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
    const attemptId = this.attemptData()?.attemptId || 1;
    console.log('attemptId:', attemptId);
    console.log('answers:', this.answers());

    // if (!attemptId) {
    //   toast.error('Attempt not started. Cannot save answers.');
    //   return;
    // }

    // const payload = {
    //     questionId: Number(questionId),
    //     answerText,
    //     selectedOptionId
    //   }
    // };


    this.testService.saveAnswer(attemptId, payload).subscribe({
      next: () => toast.success('Answers saved successfully!'),
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
      },
      error: (err) => {
        console.error('Failed to start attempt:', err);
        toast.error('Failed to start the test. Please try again later.');
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
    alert('Time is up!');
    // Call your test submit function here
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
      this.startAttempt();
      console.log('Current Step:', this.currentStep);
    } else if (this.currentStep === '2') {
      this.currentStep = '3';
      console.log('Current Step:', this.currentStep);
    }
  }
  goBack() { 
    if (this.currentStep === '3') {
      this.currentStep = '2';
    } else if (this.currentStep === '2') {
      this.currentStep = '1';
    }
  }
  finishSection() { console.log('Finishing...'); }

}
