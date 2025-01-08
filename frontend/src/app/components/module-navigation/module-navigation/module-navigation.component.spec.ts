import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleNavigationComponent } from './module-navigation.component';

describe('ModuleNavigationComponent', () => {
  let component: ModuleNavigationComponent;
  let fixture: ComponentFixture<ModuleNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
