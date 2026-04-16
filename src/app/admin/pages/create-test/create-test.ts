import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateTestRequest } from '../../models/test';
import { TestService } from '../../services/test';
import { Part } from '../../models/part';
import { PartService } from '../../services/part-service';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Passage } from '../../models/passage';
import { PassageService } from '../../services/passage-service';
import { Router } from '@angular/router';

interface Group { id: number; question_type: string; title: string; passage: string; sort_order: number; instructions: string; }
interface Question { id: number; group_id: number; question_number: number; question_text: string; prefix: string; suffix:string; option_a:string, option_b:string, option_c:string, option_d:string, sort_order: number; answer: string }


@Component({
  selector: 'app-create-test',
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './create-test.html',
  styleUrl: './create-test.css',
})
export class CreateTest implements OnInit{
  steps = ['Test Info', 'Parts', 'Passages', 'Questions', 'Review'];
  currentStep = 1;
  isEditing = false;
  editingId: number | null = null;
  testId: number | null = null;


  groups: Group[] = [];
  questions: Question[] = [];
  group: Group = this.getEmptyGroup();
  newQuestion: Partial<Question> = this.getEmptyQuestion();
  selectedGroupId = signal<number | null>(null);

  subTestTypes = ['READING', 'LISTENING'];
  testForm: CreateTestRequest = {
    title: '',
    description: '',
    subTestType: 'READING',
    totalTimeLimitMinutes: 60
  };

  question_types = ['TEXT_MATCHING', 'SHORT_ANSWER', 'GAP_FILL', 'MCQ_3', 'MCQ_4', 'NOTE_COMPLETION'];
  partLebels = ['PART_A', 'PART_B', 'PART_C'];

  partForm: Part = this.getEmptyPart();
  partList: Part[] = [];

  passageForm: Passage = this.getEmptyPassage();
  passages : Passage[] = [];
  
    

  typeLabels: Record<string, string> = { TEXT_MATCHING: 'Text Matching', SHORT_ANSWER: 'Short Answer', GAP_FILL: 'Gap Fill', MCQ_3: 'MCQ (A/B/C)', MCQ_4: 'MCQ (A/B/C/D)', NOTE_COMPLETION: 'Note Completion' };
  typeColors: Record<string, string> = { TEXT_MATCHING: 'bg-purple-50 text-purple-700', SHORT_ANSWER: 'bg-blue-50 text-blue-700', GAP_FILL: 'bg-teal-50 text-teal-700', MCQ_3: 'bg-amber-50 text-amber-700', MCQ_4: 'bg-orange-50 text-orange-700', NOTE_COMPLETION: 'bg-pink-50 text-pink-700' };
  textOptions = ['Text A', 'Text B', 'Text C', 'Text D'];

  constructor(private testService:TestService, private partService:PartService, private passageService:PassageService, private router:Router){}

  ngOnInit() {
    this.loadFromLocalStorage();
    if (this.groups.length > 0) {
      this.selectGroup(this.groups[this.groups.length - 1].id); // auto-select latest group
    }

    const state = history.state as any;

    if (state?.testId) {
      this.testId = state.testId;
      this.testById(state.testId); 
    }
    else {
      const testIdString = localStorage.getItem('testId');
      const testId: number | null = testIdString ? parseInt(testIdString, 10) : null;
      if(testId != null){
        this.testId = testId;
        this.testById(testId);
      }
    }

    
  }

  saveTest(): void {
    if(this.testId != null){
      this.testById(this.testId);
    }
    else{
      this.testService.createTest(this.testForm).subscribe({
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
          this.testForm.title = response.data.title;
          this.testForm.subTestType = response.data.subTestType;
          this.testForm.totalTimeLimitMinutes = response.data.totalTimeLimitMinutes;
          this.testForm.description = response.data.description;

          console.log(response.data);
        }
      });
  }

  savePart() {
    if (!this.partForm.partLabel || !this.partForm.instructions) {
      alert('Part Label and Instructions are required!');
      return;
    }

    if(this.testId != null){
      this.partService.createPart(this.partForm, this.testId).subscribe({
        next: (response:any) => {
          console.log("Part saved == " + response.data);
          alert('Part saved successfully!');
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


  savePassage() {
    if (!this.passageForm.label || !this.passageForm.content) {
      alert('Passage Label and Content are required!');
      return;
    }

    this.passageService.createPassage(this.passageForm, this.passageForm.partId).subscribe({
      next: (response:any) => {
        console.log("Passage saved == " + response.data);
        alert('Passage saved successfully!');
      },
      error: (err) => {
        alert("Error Passage")
        console.error('Error saving test:', err);
      }
    });

  }

  getEmptyPart(): Part {
    return {
      partLabel: '',
      timeLimitMinutes: 15,
      instructions: '',
      sortOrder: 1,
      
    };
  }

  getEmptyPassage(): Passage {
    return {
      partId: 1,
      label: '',
      content: '',
      audioFileUrl: '',
      audioDurationSeconds: 10,
      sortOrder:1
     
    };
  }


  getEmptyGroup(): Group {
    return {
      id: 0,
      question_type: '',
      title: '',
      passage: '',
      sort_order: 1,
      instructions: ''
    };
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
    const savedGroups = localStorage.getItem('questionGroups');
    const savedQuestions = localStorage.getItem('questions');
    const savedTest = localStorage.getItem('tests');
    const savedParts = localStorage.getItem('parts');
    const savedPassages = localStorage.getItem('passages');

    if (savedGroups) this.groups = JSON.parse(savedGroups);
    if (savedQuestions) this.questions = JSON.parse(savedQuestions);
    if (savedParts) this.partList = JSON.parse(savedParts);
    if (savedPassages) this.passages = JSON.parse(savedPassages);
  }

  private saveToLocalStorage() {
    localStorage.setItem('questionGroups', JSON.stringify(this.groups));
    localStorage.setItem('questions', JSON.stringify(this.questions));
    localStorage.setItem('parts', JSON.stringify(this.partList));
    localStorage.setItem('passages', JSON.stringify(this.passages));
  }

 
  // Add or Update Part

  // Edit Part
  editPart(partToEdit: Part) {
    this.partForm = { ...partToEdit };
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

  // Reset Form
  resetForm() {
    this.partForm = this.getEmptyPart();
    this.isEditing = false;
    this.editingId = null;
  }

  // Cancel Edit
  cancelEdit() {
    this.resetForm();
  }




  // addGroup() {
  //   if (!this.group.title || !this.group.question_type) {
  //     alert('Title and Question Type are required!');

  //   } catch (error) {
  //     console.error('Error saving test to localStorage:', error);
  //     alert('Failed to save test. Please try again.');
  //   }
  // }

  addGroup() {
    if (!this.group.title || !this.group.question_type) {
      alert('Title and Question Type are required!');
      return;
    }

    const newGroup: Group = {
      ...this.group,
      id: Date.now() // simple unique id
    };

    this.groups.push(newGroup);
    this.saveToLocalStorage();

    // Auto-select the newly added group
    this.selectGroup(newGroup.id);

    // Reset group form
    this.group = this.getEmptyGroup();
  }

  selectGroup(groupId: number) {
    this.selectedGroupId.set(groupId);
    // Reset new question form when switching group
    this.newQuestion = { ...this.getEmptyQuestion(), group_id: groupId };
  }

  getSelectedGroup(): Group | undefined {
    return this.groups.find(g => g.id === this.selectedGroupId());
  }

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
      this.groups = this.groups.filter(g => g.id !== groupId);
      this.questions = this.questions.filter(q => q.group_id !== groupId);
      this.saveToLocalStorage();

      if (this.selectedGroupId() === groupId) {
        this.selectedGroupId.set(this.groups.length ? this.groups[0].id : null);
      }
    }
  }








// Optional: Handle Audio File (stores filename for now)
  onAudioSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.passageForm.audioFileUrl = file.name;   // You can later convert to base64 if needed
      // For real audio storage in localStorage, use FileReader + base64 (but it's heavy)
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