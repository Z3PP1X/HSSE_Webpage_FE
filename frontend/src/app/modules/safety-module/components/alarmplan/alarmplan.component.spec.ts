import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmplanComponent } from './alarmplan.component';

describe('AlarmplanComponent', () => {
  let component: AlarmplanComponent;
  let fixture: ComponentFixture<AlarmplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmplanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlarmplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
