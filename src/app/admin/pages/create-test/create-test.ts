import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
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
import { toast } from 'ngx-sonner';

interface Question { id: number; group_id: number; question_number: number; question_text: string; prefix: string; suffix:string; option_a:string, option_b:string, option_c:string, option_d:string, sort_order: number; answer: string }


@Component({
  selector: 'app-create-test',
  imports: [CommonModule, FormsModule, EditorModule, ReactiveFormsModule],
  templateUrl: './create-test.html',
  styleUrl: './create-test.css',
})
export class CreateTest implements OnInit{
  steps = ['Test Info', 'Parts', 'Passages', 'Question Groups', 'Questions', 'Review'];
  currentStep = 1;
  isEditing = false;
  editingId: number | null = null;

  testId: number | null = null;
  testForm!: FormGroup;
  subTestTypes = ['READING', 'LISTENING'];

  partLebels = ['PART_A', 'PART_B', 'PART_C'];
  partForm!: FormGroup;
  partList:any = [];
  editingPartId = signal<number | null>(null);

  passageForm!: FormGroup;
  passages : any[] = [];
  selectedFile: File | null = null;
  editingPassageId = signal<number | null>(null);

  questionTypes = ['TEXT_MATCHING', 'SHORT_ANSWER', 'GAP_FILL', 'MCQ_3', 'MCQ_4', 'NOTE_COMPLETION'];
  groupForm!: FormGroup;
  groups: any[] = [];
  editingGroupId = signal<number | null>(null);
  
  
  getSelectedGroup = signal<any>(null);
  questionForm!: FormGroup;
  questions: Question[] = [];

  selectedGroupId = signal<number | null>(null);
  questionsByGroup: { [key: number]: any[] } = {};
  editingQuestionId = signal<number | null>(null);
  questionEditData: any = {};

  

  private router = inject(Router);
  private passageService = inject(PassageService);
  private partService = inject(PartService);
  private testService = inject(TestService);
  private questionGroupService = inject(QuestionGroupService);
  private questionService = inject(QuestionService);
  private cdr = inject(ChangeDetectorRef);

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
      description: ['', []]
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
      // UPDATE
      this.testService.updateTest(formValue, this.testId as number).subscribe({
        next: (response:any) => {
          toast.success('Test updated successfully!');
        },
        error: (err) => {
          toast.error('Error updating test');
          console.error('Error updating test:', err);
        }
      });

    }
    else{
      this.testService.createTest(formValue).subscribe({
        next: (response:any) => {
          localStorage.setItem('testId', response.data.id);
          toast.success('Test saved successfully!');
        },
        error: (err) => {
          toast.error('Error saving test');
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


  // ========================== Part Section ===============================
  private initPartForm(): void {
    this.partForm = this.fb.group({
      partTitle: ['', [ Validators.minLength(3), Validators.maxLength(255)]],
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

    const testIdString = localStorage.getItem('testId');
    const testId: number | null = testIdString ? parseInt(testIdString, 10) : null;

    if (!this.testId) {
      if (!testId) {
        toast.error('Test not found!');
        return;
      }
      this.testId = testId;
    }

    if (this.editingPartId()) {
      // UPDATE
      this.partService.updatePart(this.partForm.value, this.editingPartId()!).subscribe({
        next: () => {
          toast.success('Part updated successfully!');
          this.partListByTestId();
          this.resetPartForm();
        },
        error: (err) => {
          toast.error('Error updating part');
          console.error(err);
        }
      });
    } else {
      // CREATE
      this.partService.createPart(this.partForm.value, this.testId as number).subscribe({
        next: () => {
          toast.success('Part saved successfully!');
          this.partListByTestId();
          this.resetPartForm();
        },
        error: (err) => {
          toast.error('Error saving part');
          console.error(err);
        }
      });
    }
  }

  editPart(partId: number): void {
    this.partService.partById(partId).subscribe({
      next: (response: any) => {
        const part = response.data;
        this.editingPartId.set(part.id);
        this.partForm.patchValue({
          partTitle: part.partTitle,
          partLabel: part.partLabel,
          timeLimitMinutes: part.timeLimitMinutes,
          sortOrder: part.sortOrder,
          instructions: part.instructions
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        toast.error('Error fetching part details');
        console.error(err);
      }
    });
  }

  deletePart(partId: number): void {
    if (!confirm('Are you sure you want to delete this part?')) return;

    this.partService.deletePart(partId).subscribe({
      next: () => {
        toast.success('Part deleted successfully!');
        this.partListByTestId();
      },
      error: (err) => {
        toast.error('Error deleting part');
        console.error(err);
      }
    });
  }

  resetPartForm(): void {
    this.editingPartId.set(null);
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
        this.cdr.detectChanges(); // <-- ensure UI updates after fetching parts
      },
      error: (err) => {
        // alert("Error Part List")
        console.error('Error fetching part list:', err);
      }
    });
  }

  // ========================== Passage Section ===============================
  
  private initPassageForm(): void {
    this.passageForm = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      partId: [''],
      sortOrder: [1, [Validators.required, Validators.min(1)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      audioFileUrl: [''],
      audioDurationSeconds: [10]
    });
  }

  get passageFormControls() {
    return this.passageForm.controls;
  }

  onAudioSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.passageForm.patchValue({ audioFileUrl: file.name });
    }
  }


  savePassage() {
    if (this.passageForm.invalid) {
      this.passageForm.markAllAsTouched();
      return;
    }

    const formData = this.passageForm.value;

    if (this.editingPassageId()) {
      // UPDATE
      this.passageService.updatePassage(formData, this.editingPassageId()!).subscribe({
        next: () => {
          this.passageListByTestId();
          toast.success('Passage updated successfully!');
          this.resetPassageForm();
        },
        error: (err) => {
          toast.error('Error updating passage');
          console.error(err);
        }
      });
    } else {
      // CREATE
      this.passageService.createPassage(formData, formData.partId).subscribe({
        next: () => {
          this.passageListByTestId();
          this.resetPassageForm();
          toast.success('Passage saved successfully!');
        },
        error: (err) => {
          toast.error('Error saving passage');
          console.error(err);
        }
      });
    }
  }

  editPassage(passageId: number): void {
    this.passageService.passageById(passageId).subscribe({
      next: (response: any) => {
        const passage = response.data;
        this.editingPassageId.set(passage.id);
        this.isEditing = true;
        this.passageForm.patchValue({
          label: passage.label,
          partId: passage.partId,
          sortOrder: passage.sortOrder,
          content: passage.content,
          audioFileUrl: passage.audioFileUrl,
          audioDurationSeconds: passage.audioDurationSeconds
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        // toast.error('Error fetching passage details');
        console.error(err);
      }
    });
  }

  deletePassage(passageId: number): void {
    if (!confirm('Are you sure you want to delete this passage?')) return;

    this.passageService.deletePassage(passageId).subscribe({
      next: () => {
        this.passageListByTestId();
        toast.success('Passage deleted successfully!');
      },
      error: (err) => {
        toast.error('Error deleting passage');
        console.error(err);
      }
    });
  }

  resetPassageForm(): void {
    this.editingPassageId.set(null);
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
        this.cdr.detectChanges(); // <-- ensure UI updates after fetching passages
      },
      error: (err) => {
        // toast.error('Error fetching passage list');
        console.error('Error fetching passage list:', err);
      }
    });
  }


  private initGroupForm(): void {
    this.groupForm = this.fb.group({
      title: ['', [Validators.minLength(1), Validators.maxLength(255)]],
      questionType: ['', Validators.required],
      partId: ['', ],
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

    if (this.editingGroupId()) {
      // UPDATE
      this.questionGroupService.updateQuestionGroup(formValue, this.editingGroupId()!).subscribe({
        next: () => {
          this.groupListByTestId(this.testId as number);
          this.resetGroupForm();
          toast.success('Question Group updated successfully!');
        },
        error: (err) => {
          toast.error('Error updating Question Group');
          console.error(err);
        }
      });
    } else {
      // CREATE
      this.questionGroupService.createQuestionGroup(formValue, formValue.partId).subscribe({
        next: () => {
          this.groupListByTestId(this.testId as number);
          this.resetGroupForm();
          toast.success('Question Group saved successfully!');
        },
        error: (err) => {
          toast.error('Error saving Question Group');
          console.error(err);
        }
      });
    }
  }

  groupListByTestId(testId: number) {
    this.questionGroupService.questionGroupList(testId).subscribe({
      next: (response:any) => {
        this.groups = response.data || [];
        // this.groups.forEach(g => this.questionListByGroupId(g.id));
        this.groups.forEach((g: any) => {
          this.questionsByGroup[g.id] = []; 
          this.questionListByGroupId(g.id); 
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        // toast.error('Error fetching question group list');
        console.error('Error fetching question group list:', err);
      }
    });
  }

  editGroup(groupId: number): void {
    this.questionGroupService.questionGroupById(groupId).subscribe({
      next: (response: any) => {
        const group = response.data;
        this.editingGroupId.set(group.id);
        this.groupForm.patchValue({
          title: group.title,
          questionType: group.questionType,
          partId: group.partId,
          passageId: group.passageId,
          sortOrder: group.sortOrder,
          instructions: group.instructions
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        toast.error('Error fetching group details');
        console.error(err);
      }
    });
  }

  deleteGroup(groupId: number): void {
    if (!confirm('Are you sure you want to delete this group?')) return;

    this.questionGroupService.deleteQuestionGroup(groupId).subscribe({
      next: () => {
        this.groupListByTestId(this.testId as number);
        toast.success('Question Group deleted successfully!');
      },
      error: (err) => {
        toast.error('Error deleting Question Group');
        console.error(err);
      }
    });
  }

  resetGroupForm(): void {
    this.editingGroupId.set(null);
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
        toast.error('Error fetching group details');
        console.error('Error fetching group details:', err);
      }
    });
  }


  private initQuestionForm(): void {
    this.questionForm = this.fb.group({
      questionNumber: [1, [Validators.required, Validators.min(1)]],
      questionText: ['', [Validators.minLength(5)]],
      prefixText: [''],
      suffixText: [''],
      correctText: ['', [Validators.required]],
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

  getOptionControl(index: number, controlName: string) {
    return this.options.at(index).get(controlName);
  }

  get questionFormControls() {
    return this.questionForm.controls;
  }

  saveQuestion() {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    if (!this.getSelectedGroup()) {
      toast.error('No group selected!');
      return;
    }

    const formValue = this.questionForm.value;
    const groupId = this.getSelectedGroup().id;

    if (this.editingQuestionId()) {
      // UPDATE
      this.questionService.updateQuestion(formValue, this.editingQuestionId()!).subscribe({
        next: (response: any) => {
          this.questionListByGroupId(groupId);
          this.resetQuestionForm();
          toast.success('Question updated successfully!');
        },
        error: (err) => {
          toast.error('Error updating question');
          console.error(err);
        }
      });
    } else {
      // CREATE
      this.questionService.createQuestion(formValue, groupId).subscribe({
        next: (response: any) => {
          this.questionListByGroupId(groupId);
          this.questionsByGroup = {
            ...this.questionsByGroup,
            [groupId]: response.data || []
          };
          this.resetQuestionForm();
          toast.success('Question saved successfully!');
        },
        error: (err) => {
          toast.error('Error saving question');
          console.error(err);
        }
      });
    }
  }

  editQuestion(question: any, groupId: number): void {
    // this.selectedGroupId.set(groupId); // <-- select the group first
    this.selectGroup(groupId); // <-- load group details (if needed for display)
    this.editingQuestionId.set(question.id);

    this.questionForm.patchValue({
      questionNumber: question.questionNumber,
      questionText: question.questionText,
      prefixText: question.prefixText,
      suffixText: question.suffixText,
      correctText: question.correctAnswer?.correctText ?? question.correctText,
      sortOrder: question.sortOrder,
    });

    // Patch FormArray properly
    question.options?.forEach((opt: any, i: number) => {
      this.options.at(i)?.patchValue({
        optionLabel: opt.optionLabel,
        optionText: opt.optionText,
        sortOrder: opt.sortOrder
      });
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  questionListByGroupId(groupId: number): void {
    this.questionService.questionListByGroupId(groupId).subscribe({
      next: (response: any) => {
        const data = response.data;
        this.questionsByGroup = {
          ...this.questionsByGroup,
          [groupId]: Array.isArray(data) ? data : []  // ensure array
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.questionsByGroup = {
          ...this.questionsByGroup,
          [groupId]: []
        };
        console.error(err);
      }
    });
  }

  deleteQuestion(questionId: number): void {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const groupId = this.getSelectedGroup()?.id;

    this.questionService.deleteQuestion(questionId).subscribe({
      next: (response: any) => {
        if (groupId) {
          this.questionListByGroupId(groupId);
        }
        toast.success('Question deleted successfully!');
      },
      error: (err) => {
        toast.error('Error deleting question');
        console.error(err);
      }
    });
  }

  resetQuestionForm(): void {
    this.editingQuestionId.set(null); // <-- clear edit mode
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














  // Navigation
  goNext() {
    if (this.currentStep < 6) {
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
    if (!this.testId) {
      toast.error('Test not found!');
      return;
    }

    if (!confirm('Are you sure you want to publish this test?')) return;

    this.testService.publishTest(this.testId).subscribe({
      next: () => {
        localStorage.removeItem('testId');
        toast.success('Test published successfully!');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        toast.error('Error publishing test');
        console.error(err);
      }
    });
  }





  getTotalQuestions(): number {
    return Object.values(this.questionsByGroup)
      .reduce((sum, questions) => sum + questions.length, 0);
  }


}