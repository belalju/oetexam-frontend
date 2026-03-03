import { Component, DOCUMENT, ElementRef, Inject, ViewChild } from '@angular/core';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test {
  currentStep: '1' | '2' | '3' = '1'; // Changed to 'test' to show the new section
  activeQuestion: number = 1;
  currentQuestion: number = 1;
  timeLeft: string = "00:00:51";
  isFullScreen: boolean = false;
// Grab the element reference from the template
  @ViewChild('testUI') testElement!: ElementRef;

  constructor(@Inject(DOCUMENT) private document: Document) {}

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

  // Optional: Function to exit if needed
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
