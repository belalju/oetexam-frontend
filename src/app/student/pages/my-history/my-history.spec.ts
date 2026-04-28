import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHistory } from './my-history';

describe('MyHistory', () => {
  let component: MyHistory;
  let fixture: ComponentFixture<MyHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
