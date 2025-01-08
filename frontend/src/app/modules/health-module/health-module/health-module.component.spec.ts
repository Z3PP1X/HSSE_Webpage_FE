import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthModuleComponent } from './health-module.component';

describe('HealthModuleComponent', () => {
  let component: HealthModuleComponent;
  let fixture: ComponentFixture<HealthModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
