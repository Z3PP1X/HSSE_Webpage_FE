import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafetyModuleComponent } from './safety-module.component';

describe('SafetyModuleComponent', () => {
  let component: SafetyModuleComponent;
  let fixture: ComponentFixture<SafetyModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafetyModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SafetyModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
