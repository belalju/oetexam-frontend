import { AfterViewInit, ChangeDetectorRef, Component, computed, DOCUMENT, ElementRef, inject, Inject, Input, OnDestroy, signal, ViewChild } from '@angular/core';
import { TestService } from '../../services/test-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { SafeUrl } from '@angular/platform-browser';
import { Auth } from '../../../auth/services/auth';



@Component({
  selector: 'app-test',
  imports: [CommonModule],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test implements AfterViewInit, OnDestroy { 
  @ViewChild('testUI') testElement!: ElementRef;
  currentStep: '1' | '2' | '3' | '4' = '1';
  user: any;
  activeQuestion: number = 1;
  currentQuestion: number = 1;
  isFullScreen: boolean = false;
  countdownDisplay: string = '00:00:00';
  private timeLeftInSeconds: number = 0;
  private timerInterval: any = null;
  isCountdownRunning: boolean = false;
  sectionTimeExpired = signal<boolean>(false); 
 
  testId: number | null = null;
  testData = signal<any | null>(null);
  attemptData = signal<any | null>(null);

  @Input({ required: true }) filename!: string;
  @Input() allowReplay = false; // set false for real exam mode

  @ViewChild('audioEl') audioEl!: ElementRef<HTMLAudioElement>;

  blobUrl: SafeUrl | null = null;
  private rawBlobUrl: string | null = null;
  loading = false;
  error: string | null = null;
  isPlaying = false;
  played = false;
  currentTime = 0;
  duration = 0;
  private timeInterval?: ReturnType<typeof setInterval>;

  private cdr = inject(ChangeDetectorRef);
  private testService = inject(TestService);
  private authService = inject(Auth);
  private router = inject(Router);
  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  ngAfterViewInit() {
    const minutes = this.getSectionTimeLimit();
    this.timeLeftInSeconds = minutes * 60;

    this.updateDisplay();

    // setTimeout(() => {
    //   this.enterFullScreen();
    // }, 100);
  }

  audioUrls: { [key: string]: string } = {};


  ngOnInit() {
    const state = history.state as any;

    if (state?.testId) {
      this.testId = state.testId;
      this.testById(state.testId as number); 
    }

    this.user = this.authService.currentUser();

  }

  loadAudio(filename: string): void {
    if (this.audioUrls[filename]) {
      return;
    }
    this.testService.getAudioSrc(filename).subscribe((blob) => {
      this.audioUrls[filename] = URL.createObjectURL(blob);
    });
  }

    togglePlay() {
      const audio = this.audioEl.nativeElement;
      if (this.isPlaying) {
        audio.pause();
        this.isPlaying = false;
      } else {
        audio.play();
        this.isPlaying = true;
      }
    }

   onPlay() {
      this.isPlaying = true;
      this.played = true;
      const audio = this.audioEl.nativeElement;
      this.duration = audio.duration;
      this.timeInterval = setInterval(() => {
        this.currentTime = audio.currentTime;
      }, 500);
    }

    onEnded() {
      this.isPlaying = false;
      clearInterval(this.timeInterval);
      if (!this.allowReplay) {
        this.audioEl.nativeElement.controls = false;
      }
    }
    updateProgress() {
      const audio = this.audioEl.nativeElement;
      this.currentTime = audio.currentTime;
    }

    hasAutoPlayed = false;

    loadMetadata() {
      const audio = this.audioEl.nativeElement;
      this.duration = audio.duration;

      if (!this.hasAutoPlayed && !(this.played && !this.allowReplay)) {
        this.hasAutoPlayed = true;
        audio.play()
          .then(() => { this.isPlaying = true; })
          .catch(() => { this.isPlaying = false; });
      }
    }

    // seekAudio(event: any) {
    //   const audio = this.audioEl.nativeElement;
    //   audio.currentTime = event.target.value;
    // }
    seekAudio(event: any) {
      const audio = this.audioEl.nativeElement;
      audio.currentTime = (event.target.value / 100) * this.duration;
    }

    formatTime(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    volume = 1;
    previousVolume = 1;

    changeVolume(event: any) {
      this.volume = Number(event.target.value);

      const audio = this.audioEl.nativeElement;
      audio.volume = this.volume;
    }

    toggleMute() {
      const audio = this.audioEl.nativeElement;

      if (audio.volume > 0) {
        this.previousVolume = audio.volume;
        audio.volume = 0;
        this.volume = 0;
      } else {
        audio.volume = this.previousVolume || 1;
        this.volume = audio.volume;
      }
    }

    waveHeights = [22,34,42,52,45,58,48,38,55,42,30,48,58,52,34,42,50,54,36,45];

    get progressPct(): number {
      return this.duration ? (this.currentTime / this.duration) * 100 : 0;
    }

    get activeBars(): number {
      return Math.floor((this.progressPct / 100) * this.waveHeights.length);
    }

    skipBack() {
      this.audioEl.nativeElement.currentTime = 
        Math.max(0, this.audioEl.nativeElement.currentTime - 5);
    }

    skipForward() {
      this.audioEl.nativeElement.currentTime = 
        Math.min(this.duration, this.audioEl.nativeElement.currentTime + 5);
    }


  loadAllPassagesAudio() {

    const allPassages = [
      ...this.partAPassages(),
      ...this.partBPassages(),
      ...this.partCPassages()
    ];

    allPassages.forEach((p: any) => {
      if (p.audioFileUrl) {
        this.loadAudio(p.audioFileUrl);
      }
    });
  }

  testById(id: number) {
    this.testService.testById(id).subscribe({
      next: (response: any) => {
        this.testData.set(response.data);

        setTimeout(() => {
          this.loadAllPassagesAudio();
        });
      }
    });
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

  partBOrderedPassages = computed(() => {
    const seen = new Set<number>();
    const ordered: any[] = [];

    this.partBGroups().forEach((g: any) => {
      const passage = this.getPassageBById(g.passageId);
      if (passage && !seen.has(passage.id)) {
        seen.add(passage.id);
        ordered.push(passage);
      }
    });

    this.partBPassages().forEach((p: any) => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        ordered.push(p);
      }
    });

    return ordered;
  });

  partBQuestionCount = computed(() =>
    this.partBGroups().reduce((t: number, g: any) => t + (g.questions?.length ?? 0), 0)
  );

  partCQuestionCount = computed(() =>
    this.partCGroups().reduce((t: number, g: any) => t + (g.questions?.length ?? 0), 0)
  );

  partBCQuestionCount = computed(() => this.partBQuestionCount() + this.partCQuestionCount());

  partABCQuestionCount = computed(() =>
    this.partAQuestionCount() + this.partBCQuestionCount()
  );

  totalSteps = computed(() => (this.testData()?.subTestType === 'LISTENING' ? 3 : 4));

  allPassages = computed(() => {
    return [
      ...this.partAPassages(),
      ...this.partBPassages(),
      ...this.partCPassages()
    ];
  });


  answers = signal<Record<number, { answerText: string; selectedOptionId: number | null }>>({});


  getQuestionsForGroup(groupId: number) {
    const group = [
      ...this.partAGroups(),
      ...this.partBGroups(),
      ...this.partCGroups()
    ].find((g: any) => g.id === groupId);
    return [...(group?.questions ?? [])].sort(
      (a: any, b: any) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0)
    );
  }

  // Combined time budget for Reading Part B + Part C (one continuous section)
  private partBCTimeLimit(): number {
    const partBTime = this.partB()?.timeLimitMinutes || 0;
    const partCTime = this.partC()?.timeLimitMinutes || 0;
    return partBTime + partCTime || 45;
  }

  getSectionTimeLimit(): number {
    if (this.currentStep === '2') {
      return this.partA()?.timeLimitMinutes || 60;
    } else if (this.currentStep === '3') {
      if (this.testData()?.subTestType === 'LISTENING') {
        const partATime = this.partA()?.timeLimitMinutes || 0;
        const partBTime = this.partB()?.timeLimitMinutes || 0;
        const partCTime = this.partC()?.timeLimitMinutes || 0;
        return partATime + partBTime + partCTime || 60;
      }
      // READING: Part B and Part C share one combined section timer
      return this.partBCTimeLimit();
    } else if (this.currentStep === '4') {
      return this.partBCTimeLimit();
    }
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

  startAttempt(onSuccess?: () => void) {
    if (!this.testId) return;

    this.testService.startAttempt(this.testId).subscribe({
      next: (response: any) => {
        const attemptId = response.data.attemptId;
        this.attemptData.set(response.data);
        toast.success('Test started successfully!');
        // this.router.navigate(['/student/attempt', attemptId]);
        sessionStorage.setItem('currentAttemptId', attemptId.toString());
        onSuccess?.();
      },
      error: (err) => {
        console.error('Failed to start attempt:', err.error);
        toast.error(err.error?.error || err.error?.message || 'Failed to start the test. Please try again later.');
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
    const attemptIdFromStorage = sessionStorage.getItem('currentAttemptId');

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
      next: (response:any) => {
        toast.success('Test submitted successfully!');
        sessionStorage.removeItem('currentAttemptId');
        // this.router.navigate(['/student/my-history']);
        this.router.navigate(['/results'], {
          state: { 
            attemptId: response.data.attemptId,
          }
        });
      },
      error: (err) => {
        console.error('Failed to submit attempt:', err);
        toast.error('Failed to submit the test. Please try again later.');
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

    if (this.currentStep === '2') {
      this.currentStep = '3';
      this.resetSectionTimer();
    }

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
    Object.values(this.audioUrls).forEach((url) => URL.revokeObjectURL(url));
    this.audioUrls = {};

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
      this.startAttempt(() => {
        this.resetSectionTimer();
        if (this.testData()?.subTestType === 'LISTENING') {
          this.currentStep = '3';
        } else {
          this.currentStep = '2';
        }
      });
    } else if (this.currentStep === '2') {
      this.currentStep = '3';
      this.resetSectionTimer();
    } else if (this.currentStep === '3' && this.testData()?.subTestType !== 'LISTENING') {
      // Part B and Part C are one timed section — keep the clock running
      this.currentStep = '4';
    }
  }

  // Whether the Back button is available on the current section
  canGoBack(): boolean {
    // Part B and Part C are one shared section — moving between them is allowed
    if (this.currentStep === '4') return true;
    // Cannot return to Part A (or the introduction) once this section has started
    if (this.currentStep === '3') return false;
    if (this.currentStep === '2') return !this.sectionTimeExpired();
    return true;
  }

  goBack() {
    if (this.currentStep === '4') {
      // Part B and Part C share one timed section — go back without resetting the clock
      this.currentStep = '3';
      return;
    } else if (this.currentStep === '3') {
      // Cannot go back from section 3 (Part B, or Part A/B/C combined for LISTENING)
      toast.error('You cannot go back to Part A after starting this section');
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
