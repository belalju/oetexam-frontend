import { TestBed } from '@angular/core/testing';

import { QuestionGroupService } from './question-group-service';

describe('QuestionGroupService', () => {
  let service: QuestionGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
