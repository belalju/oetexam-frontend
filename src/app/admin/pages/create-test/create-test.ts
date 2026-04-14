import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Test { id: number; title: string; subTestType: string; description: string; is_published: boolean | string; time_limit_minutes: number; }
interface Part { id: number; test_id: number; label: string; time_limit: number; sort_order: number; instructions: string; }
interface Passage { id: number; test_part: string; label: string; sort_order: number; audio: string; content: string; }
interface Group { id: number; question_type: string; title: string; passage: string; sort_order: number; instructions: string; }
interface Question { id: number; group_id: number; question_number: number; question_text: string; prefix: string; suffix:string; option_a:string, option_b:string, option_c:string, option_d:string, sort_order: number; answer: string }


@Component({
  selector: 'app-create-test',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-test.html',
  styleUrl: './create-test.css',
})
export class CreateTest {
  steps = ['Test Info', 'Parts', 'Passages', 'Questions', 'Review'];
  currentStep = 1;
  readyTestSave = true;
  isEditing = false;
  editingId: number | null = null;

  groups: Group[] = [];
  questions: Question[] = [];
  group: Group = this.getEmptyGroup();
  newQuestion: Partial<Question> = this.getEmptyQuestion();
  selectedGroupId = signal<number | null>(null);

  test : Test = { id: 0, title: '', subTestType: 'Reading', description: '', is_published: 'Draft', time_limit_minutes: 60 };

  question_types = ['TEXT_MATCHING', 'SHORT_ANSWER', 'GAP_FILL', 'MCQ_3', 'MCQ_4', 'NOTE_COMPLETION'];
  partLebels = ['Part A', 'Part B', 'Part C'];

  part: Part = this.getEmptyPart();
  partList: Part[] = [];

  passage: Passage = this.getEmptyPassage();
  passages : Passage[] = [];
  
    

  typeLabels: Record<string, string> = { TEXT_MATCHING: 'Text Matching', SHORT_ANSWER: 'Short Answer', GAP_FILL: 'Gap Fill', MCQ_3: 'MCQ (A/B/C)', MCQ_4: 'MCQ (A/B/C/D)', NOTE_COMPLETION: 'Note Completion' };
  typeColors: Record<string, string> = { TEXT_MATCHING: 'bg-purple-50 text-purple-700', SHORT_ANSWER: 'bg-blue-50 text-blue-700', GAP_FILL: 'bg-teal-50 text-teal-700', MCQ_3: 'bg-amber-50 text-amber-700', MCQ_4: 'bg-orange-50 text-orange-700', NOTE_COMPLETION: 'bg-pink-50 text-pink-700' };
  textOptions = ['Text A', 'Text B', 'Text C', 'Text D'];

  ngOnInit() {
    this.loadFromLocalStorage();
    if (this.groups.length > 0) {
      this.selectGroup(this.groups[this.groups.length - 1].id); // auto-select latest group
    }
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

  getEmptyPart(): Part {
    return {
      id: 0,
      test_id: 0,
      label: '',
      time_limit: 15,
      sort_order: 1,
      instructions: ''
    };
  }

  getEmptyPassage(): Passage {
    return {
      id: 0,
      test_part: '',
      label: '',
      sort_order: 1,
      audio: '',
      content: ''
    };
  }

  // ==================== Local Storage ====================
  private loadFromLocalStorage() {
    const savedGroups = localStorage.getItem('questionGroups');
    const savedQuestions = localStorage.getItem('questions');
    const savedTest = localStorage.getItem('tests');
    const savedParts = localStorage.getItem('parts');
    const savedPassages = localStorage.getItem('passages');

    if (savedTest) this.test = JSON.parse(savedTest);
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

  saveTest() {
    if (!this.test.title?.trim()) {
      alert('Title is required!');
      return;
    }
    if (!this.test.subTestType) {
      alert('Sub-Test Type is required!');
      return;
    }

    const isPublished = this.test.is_published === 'Published' || 
                        this.test.is_published === true || 
                        this.test.is_published === 'true';

    const testToSave: Test = {
      ...this.test,
      id: this.test.id || Date.now(),           // Keep existing ID if editing
      is_published: isPublished,
    };

    if (!this.readyTestSave) {
      alert('Test has already been saved. Please make changes before saving again.');
     this.goNext();

    }

    try {
      const existingTestsJson = localStorage.getItem('tests');
      let tests: Test[] = existingTestsJson ? JSON.parse(existingTestsJson) : [];

      if (this.test.id) {
        const index = tests.findIndex(t => t.id === this.test.id);
        if (index !== -1) {
          tests[index] = testToSave;
        } else {
          tests.push(testToSave);
        }
      } 
      else {
        tests.push(testToSave);
      }

      localStorage.setItem('tests', JSON.stringify(tests));

      alert('Test saved successfully!');
      console.log('Saved Test:', testToSave);
      this.readyTestSave = false;
      // this.goNext(); // Move to next step after saving
    } catch (error) {
      console.error('Error saving test to localStorage:', error);
      alert('Failed to save test. Please try again.');
    }
  }

  // Add or Update Part
  addOrUpdatePart() {
    if (!this.part.label || !this.part.instructions) {
      alert('Part Label and Instructions are required!');
      return;
    }

    if (this.isEditing && this.editingId !== null) {
      const index = this.partList.findIndex(p => p.id === this.editingId);
      if (index !== -1) {
        this.partList[index] = { ...this.part, id: this.editingId };
      }
    } else {
      const newPart: Part = {
        ...this.part,
        id: Date.now()
      };
      this.partList.push(newPart);
    }

    this.saveToLocalStorage();
    this.resetForm();
    alert(this.isEditing ? 'Part updated successfully!' : 'Part added successfully!');
  }

  // Edit Part
  editPart(partToEdit: Part) {
    this.part = { ...partToEdit };
    this.isEditing = true;
    this.editingId = partToEdit.id;
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete Part
  deletePart(id: number) {
    if (confirm('Are you sure you want to delete this part?')) {
      this.partList = this.partList.filter(p => p.id !== id);
      this.saveToLocalStorage();
      alert('Part deleted successfully!');
    }
  }

  // Reset Form
  resetForm() {
    this.part = this.getEmptyPart();
    this.isEditing = false;
    this.editingId = null;
  }

  // Cancel Edit
  cancelEdit() {
    this.resetForm();
  }

  addOrUpdatePassage() {
    if (!this.passage.label || !this.passage.content) {
      alert('Passage Label and Content are required!');
      return;
    }

    if (this.isEditing && this.editingId) {
      // Update
      const index = this.passages.findIndex(p => p.id === this.editingId);
      if (index !== -1) {
        this.passages[index] = { 
          ...this.passage, 
          id: this.editingId 
        };
      }
    } else {
      // Add New
      const newPassage: Passage = {
        ...this.passage,
        id: Date.now(),
      };
      this.passages.push(newPassage);
    }

    this.saveToLocalStorage();
    this.resetPassageForm();

    alert(this.isEditing ? 'Passage updated successfully!' : 'Passage added successfully!');
  }

  editPassage(passageToEdit: Passage) {
    this.passage = { ...passageToEdit };
    this.isEditing = true;
    this.editingId = passageToEdit.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deletePassage(id: number) {
    if (confirm('Are you sure you want to delete this passage?')) {
      this.passages = this.passages.filter(p => p.id !== id);
      this.saveToLocalStorage();
      alert('Passage deleted!');
    }
  }

  resetPassageForm() {
    this.passage = this.getEmptyPassage();
    this.isEditing = false;
    this.editingId = null;
  }

  cancelPassageEdit() {
    this.resetPassageForm();
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


  clearSavedTest() {
    localStorage.removeItem('tests');
    this.test = {
      id: 0,
      title: '',
      subTestType: '',
      description: '',
      is_published: false,
      time_limit_minutes: 60
    };
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
      this.passage.audio = file.name;   // You can later convert to base64 if needed
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
