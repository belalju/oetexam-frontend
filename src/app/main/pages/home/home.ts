import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private route = inject(ActivatedRoute);

  readonly faqs = [
    {
      question: 'Is the free OET practice test really free?',
      answer: 'Yes. You can take one free Reading and Listening practice test to explore the platform before choosing a paid practice plan.',
    },
    {
      question: 'What does Premium Access include?',
      answer: 'Premium Access gives you access to additional OET Reading and Listening practice tests for regular online preparation.',
    },
    {
      question: 'Are Reading and Listening the same for doctors and nurses?',
      answer: 'Yes. OET Reading and Listening are common to all candidates. Writing and Speaking tasks are profession-specific.',
    },
    {
      question: 'Can I buy Writing or Speaking feedback separately?',
      answer: 'Yes. Writing and Speaking evaluation services can be purchased separately when you need targeted feedback.',
    },
    {
      question: 'Is OET Practice affiliated with OET?',
      answer: 'No. OET Practice is an independent preparation platform and is not affiliated with, endorsed by, or connected to OET or any official test provider.',
    },
  ];

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => this.scrollToSection(fragment), 100);
      }
    });
  }

  openSection: string = 'prep';

  toggle(id: string) {
    this.openSection = this.openSection === id ? '' : id;
  }

  // scrollToSection(sectionId: string) {
  //   const element = document.getElementById(sectionId);
  //   if (element) {
  //     const headerOffset = 100; // Adjust based on your sticky header height
  //     const elementPosition = element.getBoundingClientRect().top;
  //     const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  //     window.scrollTo({
  //       top: offsetPosition,
  //       behavior: 'smooth'
  //     });
  //   }
  // }

  activeSection: string = 'features'; // Default active section

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const sections = ['features', 'pricing', 'live-classes', 'teachers'];
    const scrollPosition = window.pageYOffset + 100; // Offset for the sticky header

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const top = element.offsetTop;
        const height = element.offsetHeight;

        if (scrollPosition >= top && scrollPosition < top + height) {
          this.activeSection = section;
        }
      }
    }
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }

}
