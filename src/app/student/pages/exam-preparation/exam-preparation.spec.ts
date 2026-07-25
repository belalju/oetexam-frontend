import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamPreparation } from './exam-preparation';

describe('ExamPreparation', () => {
  let component: ExamPreparation;
  let fixture: ComponentFixture<ExamPreparation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamPreparation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamPreparation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
