import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleDebugComponent } from './module-debug.component';

describe('ModuleDebugComponent', () => {
  let component: ModuleDebugComponent;
  let fixture: ComponentFixture<ModuleDebugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleDebugComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleDebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
