import { AfterViewInit, ChangeDetectorRef, Component, DOCUMENT, ElementRef, inject, Inject, OnDestroy, ViewChild } from '@angular/core';

interface QTest { id: number; title: string; subTestType: string; description: string; is_published: boolean | string; time_limit_minutes: number; }
interface Part { id: number; test_id: number; label: string; time_limit: number; sort_order: number; instructions: string; }
interface Passage { id: number; test_part_id: number; label: string; sort_order: number; audio: string; content: string; }
interface Group { id: number; question_type: string; title: string; passage: string; sort_order: number; instructions: string; }
interface Question { id: number; group_id: number; question_number: number; question_text: string; sort_order: number; answer: string }


@Component({
  selector: 'app-test',
  imports: [],
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
 

  testData: QTest[] = [];
  qTest : QTest = { id: 0, title: 'Sample Test', subTestType: 'IELTS', description: 'This is a sample test description.', is_published: false, time_limit_minutes: 60};
  groups: Group[] = [];
  questions: Question[] = [];
  passages: Passage[] = [];
  parts: Part[] = [];
  
  private cdr = inject(ChangeDetectorRef);
  constructor(@Inject(DOCUMENT) private document: Document) {
    this.loadFromLocalStorage();
  }

  ngAfterViewInit(): void {
    // Set initial time from API/data (in minutes)
    const minutes = this.testData[0]?.time_limit_minutes || 60;
    this.timeLeftInSeconds = minutes * 60;

    this.startCountdown();
    this.updateDisplay();   // Show 00:00:00 initially

    // Automatically enter fullscreen when the component is fully rendered
    setTimeout(() => {
      this.enterFullScreen();
    }, 100); // small delay ensures the element is painted and ready
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

  private loadFromLocalStorage() {
    const savedGroups = localStorage.getItem('questionGroups');
    const savedQuestions = localStorage.getItem('questions');
    const savedPassages = localStorage.getItem('passages');
    const savedParts = localStorage.getItem('parts');
    const savedTest = localStorage.getItem('tests');

    if (savedGroups) this.groups = JSON.parse(savedGroups);
    if (savedQuestions) this.questions = JSON.parse(savedQuestions);
    if (savedPassages) this.passages = JSON.parse(savedPassages);
    if (savedParts) this.parts = JSON.parse(savedParts);
    if (savedTest) this.testData = JSON.parse(savedTest);
  }

  getQuestionsForGroup(groupId: number): Question[] {
    return this.questions
      .filter(q => q.group_id === groupId)
      .sort((a, b) => a.sort_order - b.sort_order);
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
    } else if (this.currentStep === '2') {
      this.currentStep = '3';
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
