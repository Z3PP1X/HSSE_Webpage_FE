import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFrameComponent } from './form-frame.component';

describe('FormFrameComponent', () => {
  let component: FormFrameComponent;
  let fixture: ComponentFixture<FormFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFrameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
