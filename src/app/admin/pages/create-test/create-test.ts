import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Form, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTestRequest } from '../../models/test';
import { TestService } from '../../services/test';
import { Part } from '../../models/part';
import { PartService } from '../../services/part-service';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Passage } from '../../models/passage';
import { PassageService } from '../../services/passage-service';
import { Router } from '@angular/router';
import { QuestionGroup } from '../../models/question-group';
import { QuestionGroupService } from '../../services/question-group-service';
import { QuestionService } from '../../services/question-service';

interface Question { id: number; group_id: number; question_number: number; question_text: string; prefix: string; suffix:string; option_a:string, option_b:string, option_c:string, option_d:string, sort_order: number; answer: string }


@Component({
  selector: 'app-create-test',
  imports: [CommonModule, FormsModule, EditorModule, ReactiveFormsModule],
  templateUrl: './create-test.html',
  styleUrl: './create-test.css',
})
export class CreateTest implements OnInit{
  steps = ['Test Info', 'Parts', 'Passages', 'Question Groups', 'Questions', 'Review'];
  currentStep = 4;
  isEditing = false;
  editingId: number | null = null;

  testId: number | null = null;
  testForm!: FormGroup;
  subTestTypes = ['READING', 'LISTENING'];

  partLebels = ['PART_A', 'PART_B', 'PART_C'];
  partForm!: FormGroup;
  partList:any = [];

  passageForm!: FormGroup;
  passages : any[] = [];
  selectedFile: File | null = null;

  questionTypes = ['TEXT_MATCHING', 'SHORT_ANSWER', 'GAP_FILL', 'MCQ_3', 'MCQ_4', 'NOTE_COMPLETION'];
  groupForm!: FormGroup;
  groups: any[] = [];
  
  
  getSelectedGroup = signal<any>(null);
  questionForm!: FormGroup;
  questions: Question[] = [];

  newQuestion: Partial<Question> = this.getEmptyQuestion();
  selectedGroupId = signal<number | null>(null);

  

  private router = inject(Router);
  private passageService = inject(PassageService);
  private partService = inject(PartService);
  private testService = inject(TestService);
  private questionGroupService = inject(QuestionGroupService);
  private questionService = inject(QuestionService);

  typeLabels: Record<string, string> = { TEXT_MATCHING: 'Text Matching', SHORT_ANSWER: 'Short Answer', GAP_FILL: 'Gap Fill', MCQ_3: 'MCQ (A/B/C)', MCQ_4: 'MCQ (A/B/C/D)', NOTE_COMPLETION: 'Note Completion' };
  typeColors: Record<string, string> = { TEXT_MATCHING: 'bg-purple-50 text-purple-700', SHORT_ANSWER: 'bg-blue-50 text-blue-700', GAP_FILL: 'bg-teal-50 text-teal-700', MCQ_3: 'bg-amber-50 text-amber-700', MCQ_4: 'bg-orange-50 text-orange-700', NOTE_COMPLETION: 'bg-pink-50 text-pink-700' };
  textOptions = ['Text A', 'Text B', 'Text C', 'Text D'];

  constructor(
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    const state = history.state as any;

    if (state?.testId) {
      this.testId = state.testId;
      this.testById(state.testId as number); 
    }
    else {
      const testIdString = localStorage.getItem('testId');
      const testId: number | null = testIdString ? parseInt(testIdString, 10) : null;
      if(testId != null){
        this.testId = testId;
        this.testById(testId);
      }
    }
    this.initTestForm();
    this.initPartForm();
    this.initPassageForm();
    this.initGroupForm();
    this.initQuestionForm();

    this.partListByTestId();
    this.passageListByTestId();
    this.groupListByTestId(state?.testId || this.testId);
    
  }

  // Test Form
  private initTestForm(): void {
    this.testForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      subTestType: ['READING', Validators.required],
      totalTimeLimitMinutes: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(180),           // max 3 hours
        Validators.pattern('^[0-9]+$') // only numbers
      ]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  get testFormControls() {
    return this.testForm.controls;
  }

  saveTest(): void {
    if (this.testForm.invalid) {
      this.testForm.markAllAsTouched();   // Show all validation errors
      return;
    }
    const formValue = this.testForm.value;

    if(this.testId != null){
      this.testById(this.testId as number);
    }
    else{
      this.testService.createTest(formValue).subscribe({
        next: (response:any) => {
          localStorage.setItem('testId', response.data.id);
          console.log('Test created:', response.data);
          alert('Test saved successfully!');
        },
        error: (err) => {
          alert("Error")
          console.error('Error saving test:', err);
        }
      });
    }
  }

  testById(id:number){
    this.testService.testById(id).subscribe({
        next: (response:any) => {
          const data = response.data;

          this.testForm.patchValue({
            title: data.title || '',
            subTestType: data.subTestType || 'READING',
            totalTimeLimitMinutes: data.totalTimeLimitMinutes || 60,
            description: data.description || ''
          });

        }
      });
  }


  // Part Form
  private initPartForm(): void {
    this.partForm = this.fb.group({
      partTitle: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      partLabel: ['', Validators.required],
      timeLimitMinutes: [15, [Validators.required, Validators.min(1), Validators.max(180)]],
      sortOrder: [1, [Validators.required, Validators.min(1)]],
      instructions: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  get partFormControls() {
    return this.partForm.controls;
  }

  savePart() {
    if (this.partForm.invalid) {
      this.partForm.markAllAsTouched();
      return;
    }

    if (!this.testId) {
      alert('Test not found!');
      return;
    }

    if(this.testId != null){
      this.partService.createPart(this.partForm.value, this.testId as number).subscribe({
        next: (response:any) => {
          alert('Part saved successfully!');
          this.partListByTestId(); // Refresh the part list
          this.resetPartForm();
        },
        error: (err) => {
          alert("Error Part")
          console.error('Error saving test:', err);
        }
      });
    }
    else{
      alert('Test not found!');
    }

  }

  resetPartForm(): void {
    this.partForm.reset({
      partTitle: '',
      partLabel: '',
      timeLimitMinutes: 15,
      sortOrder: 1,
      instructions: ''
    });
  }

  partListByTestId(){
    if(this.testId == null) return;

    this.partService.partList(this.testId as number).subscribe({
      next: (response:any) => {
        this.partList = response.data || [];
      },
      error: (err) => {
        alert("Error Part List")
        console.error('Error fetching part list:', err);
      }
    });
  }

  private initPassageForm(): void {
    this.passageForm = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      partId: ['', Validators.required],
      sortOrder: [1, [Validators.required, Validators.min(1)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      audioFileUrl: [''],
      audioDurationSeconds: [10]
    });
  }

  get passageFormControls() {
    return this.passageForm.controls;
  }

  // Handle audio file selection
  onAudioSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Optional: show file name
      this.passageForm.patchValue({ audioFileUrl: file.name });
    }
  }


  // Save Passage
  savePassage() {
    if (this.passageForm.invalid) {
      this.passageForm.markAllAsTouched();
      return;
    }

    const formData = this.passageForm.value;

    this.passageService.createPassage(formData, formData.partId).subscribe({
      next: (response:any) => {
        this.passageListByTestId(); 
        this.resetPassageForm();
        alert('Passage saved successfully!');
        
        
      },
      error: (err) => {
        alert("Error Passage")
        console.error('Error saving test:', err);
      }
    });

  }

  resetPassageForm(): void {
    this.passageForm.reset({
      label: '',
      partId: '',
      sortOrder: 1,
      content: '',
      audioFileUrl: '',
      audioDurationSeconds: 10
    });
    this.selectedFile = null;
  }

  // Passage List by Test ID (to show in Part section)
  passageListByTestId(){
    this.passageService.passageList(this.testId as number).subscribe({
      next: (response:any) => {
        this.passages = response.data || [];
      },
      error: (err) => {
        alert("Error Passage List")
        console.error('Error fetching passage list:', err);
      }
    });
  }


  private initGroupForm(): void {
    this.groupForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      questionType: ['', Validators.required],
      partId: ['', Validators.required],
      passageId: [''],                    // optional
      sortOrder: [1, [Validators.required, Validators.min(1)]],
      instructions: ['', [Validators.maxLength(800)]]
    });
  }

  get groupFormControls() {
    return this.groupForm.controls;
  }

  saveGroup() {
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }

    const formValue = this.groupForm.value;

    this.questionGroupService.createQuestionGroup(formValue, formValue.partId).subscribe({
      next: (response) => {
        this.groupListByTestId(this.testId as number); 
        this.resetGroupForm();
        alert('Question Group saved successfully!');
      },
      error: (err) => {
        alert("Error Question Group")
        console.error('Error saving question group:', err);
      }
    });
  }

  groupListByTestId(testId: number) {
    this.questionGroupService.questionGroupList(testId).subscribe({
      next: (response:any) => {
        this.groups = response.data || [];
      },
      error: (err) => {
        alert("Error Question Group List")
        console.error('Error fetching question group list:', err);
      }
    });
  }

  resetGroupForm(): void {
    this.groupForm.reset({
      title: '',
      questionType: '',
      partId: '',
      passageId: '',
      sortOrder: 1,
      instructions: ''
    });
  }

  selectGroup(groupId: number) {
    this.questionGroupService.questionGroupById(groupId).subscribe({
      next: (response:any) => {
        this.getSelectedGroup.set(response.data);
      },
      error: (err) => {
        alert("Error fetching group details")
        console.error('Error fetching group details:', err);
      }
    });
  }


  private initQuestionForm(): void {
    this.questionForm = this.fb.group({
      questionNumber: [1, [Validators.required, Validators.min(1)]],
      questionText: ['', [Validators.required, Validators.minLength(5)]],
      prefixText: [''],
      suffixText: [''],
      correctText: [''],
      sortOrder: [1, [Validators.required, Validators.min(1)]],
      options: this.fb.array([
        this.fb.group({
          optionLabel: ['A', Validators.required],
          optionText: ['', ],
          sortOrder: [1, [Validators.required, Validators.min(1)]]
        }),
        this.fb.group({
          optionLabel: ['B', Validators.required],
          optionText: ['', ],
          sortOrder: [2, [Validators.required, Validators.min(1)]]
        }),
        this.fb.group({
          optionLabel: ['C', Validators.required],
          optionText: ['', ],
          sortOrder: [3, [Validators.required, Validators.min(1)]]
        }),
        this.fb.group({
          optionLabel: ['D', Validators.required],
          optionText: ['', ],
          sortOrder: [4, [Validators.required, Validators.min(1)]]
        })
      ])
    });
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  // Helper to get option controls easily
  getOptionControl(index: number, controlName: string) {
    return this.options.at(index).get(controlName);
  }

  get questionFormControls() {
    return this.questionForm.controls;
  }

  saveQuestion() {
    console.log('Saving question with form value:', this.questionForm.value);
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    if(!this.getSelectedGroup()) {
      alert('No group selected!');
      return;
    }

    const formValue = this.questionForm.value;

    this.questionService.createQuestion(formValue, this.getSelectedGroup().id).subscribe({
      next: (response) => {
        this.questionListByGroupId(this.getSelectedGroup().id);
        this.resetQuestionForm();
        alert('Question saved successfully!');
      },
      error: (err) => {
        alert("Error Question")
        console.error('Error saving question:', err);
      }
    });
  }

  questionListByGroupId(groupId: number) {
    this.questionService.questionListByGroupId(groupId).subscribe({
      next: (response:any) => {
        return response.data || [];
      },
      error: (err) => {
        alert("Error Question Group List")
        console.error('Error fetching question group list:', err);
      }
    });
  }

  resetQuestionForm(): void {
    this.questionForm.reset({
      questionNumber: 1,
      questionText: '',
      correctText: '',
      prefixText: '',
      suffixText: '',
      sortOrder: 1,
      options: [
        { optionLabel: 'A', optionText: '', sortOrder: 1 },
        { optionLabel: 'B', optionText: '', sortOrder: 2 },
        { optionLabel: 'C', optionText: '', sortOrder: 3 },
        { optionLabel: 'D', optionText: '', sortOrder: 4 }
      ]
    });
  }









  private getEmptyQuestion(): Partial<Question> {
    return {
      question_number: 1,
      question_text: '',
      prefix: '',
      suffix: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      sort_order: 1,
      answer: ''
    };
  }



  // ==================== Local Storage ====================
  private loadFromLocalStorage() {
    
  }

  private saveToLocalStorage() {
    
  }

 
  // Add or Update Part

  // Edit Part
  editPart(partToEdit: Part) {
    // this.partForm = { ...partToEdit };
    this.isEditing = true;
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete Part
  deletePart(id: number) {
    if (confirm('Are you sure you want to delete this part?')) {
      this.saveToLocalStorage();
      alert('Part deleted successfully!');
    }
  }






  // addGroup() {
  //   if (!this.group.title || !this.group.question_type) {
  //     alert('Title and Question Type are required!');

  //   } catch (error) {
  //     console.error('Error saving test to localStorage:', error);
  //     alert('Failed to save test. Please try again.');
  //   }
  // }


  // getSelectedGroup(): QuestionGroup | undefined {
  //   return this.groups.find(g => g.id === this.selectedGroupId());
  // }

  addQuestion() {
    const selectedId = this.selectedGroupId();
    if (!selectedId) {
      alert('Please select or create a group first!');
      return;
    }

    const newQ: Question = {
      id: Date.now(),
      group_id: selectedId,
      question_number: this.newQuestion.question_number || 1,
      question_text: this.newQuestion.question_text || '',
      prefix: this.newQuestion.prefix || '',
      suffix: this.newQuestion.suffix || '',
      option_a: this.newQuestion.option_a || '',
      option_b: this.newQuestion.option_b || '',
      option_c: this.newQuestion.option_c || '',
      option_d: this.newQuestion.option_d || '',
      sort_order: this.newQuestion.sort_order || 1,
      answer: this.newQuestion.answer || ''
    };

    this.questions.push(newQ);
    this.saveToLocalStorage();

    // Reset question form (keep same group)
    this.newQuestion = { ...this.getEmptyQuestion(), group_id: selectedId };
  }

  getQuestionsForGroup(groupId: number): Question[] {
    return this.questions
      .filter(q => q.group_id === groupId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }



  deleteQuestion(qId: number) {
    if (confirm('Delete this question?')) {
      this.questions = this.questions.filter(q => q.id !== qId);
      this.saveToLocalStorage();
    }
  }

  // Optional: delete group + its questions
  deleteGroup(groupId: number) {
    if (confirm('Delete this group and all its questions?')) {
      
    }
  }









  // Navigation
  goNext() {
    if (this.currentStep < 5) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  jumpTo(step: number) {
    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  publishTest() {
    alert('Test published successfully! 🎉');
  }

  // Getters for computed data views
  get groupedPassages() {
    const grouped: Record<string, Passage[]> = {};
    this.passages.forEach(p => {
      if (!grouped[p.label]) grouped[p.label] = [];
      grouped[p.label].push(p);
    });
    return Object.entries(grouped).map(([part, list]) => ({ part, list }));
  }

}