import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCatalog } from './test-catalog';

describe('TestCatalog', () => {
  let component: TestCatalog;
  let fixture: ComponentFixture<TestCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCatalog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCatalog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
