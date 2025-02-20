import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandableAccordionCardComponent } from './expandable-accordion-card.component';

describe('ExpandableAccordionCardComponent', () => {
  let component: ExpandableAccordionCardComponent;
  let fixture: ComponentFixture<ExpandableAccordionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandableAccordionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpandableAccordionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
