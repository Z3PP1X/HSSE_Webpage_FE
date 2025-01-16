import { CommonModule } from '@angular/common';
import { Component, input, HostBinding, signal, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition, } from '@angular/animations';
import { ActiveModuleService } from '../../../navbar/services/selected-module.service';

@Component({
  selector: 'app-expandable-accordion-card',
  standalone: true,
  imports: [CommonModule],
  animations: [

    trigger('openClose', [
      state(
        'open',
        style({

        })
      ),
      state(
        'closed',
        style({

        })
      ),
      transition('open => closed', [animate('300ms 100ms ease-in')]),
      transition('closed => open', [animate('300ms 100ms ease-out')]),
    ])



  ],
  templateUrl: './expandable-accordion-card.component.html',
  styleUrl: './expandable-accordion-card.component.css'
})
export class ExpandableAccordionCardComponent implements OnInit{

  catalogItemTitle = input.required<string>();
  id = input.required<string>();
  isOpen = signal<boolean>(false);

  constructor(private activeCategory: ActiveModuleService){}

  ngOnInit(): void {

    this.activeCategory.selectedModule$.subscribe((activeId) => {
      if (activeId === this.id()) {
        this.isOpen.set(!this.isOpen());
      } else {
        switch (this.isOpen()) {
          case true: {
            this.isOpen.set(false);
            break;
          }
          case false: {
            break;
          }
        }
      }
    });

  }

  toggleExpand(){

    this.activeCategory.setActiveModule(this.id())
    console.log("value - changed")

  }

}
