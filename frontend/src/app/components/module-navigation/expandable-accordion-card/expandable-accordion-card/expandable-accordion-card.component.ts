import { CommonModule } from '@angular/common';
import { Component, input, HostBinding, signal, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition, } from '@angular/animations';
import { ExpandedCardService } from '../services/expanded-card.service';


@Component({
  selector: 'app-expandable-accordion-card',
  standalone: true,
  imports: [CommonModule],
  animations: [

    [
      trigger('openClose', [
        state(
          'open',
          style({
            height: '500px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgb(22, 101, 52)',
          })
        ),
        state(
          'closed',
          style({
            height: '*',
            borderWidth: '0',
          })
        ),
        transition('open <=> closed', [animate('250ms 100ms ease-in-out')]),
      ]),
    ],
  ],
  templateUrl: './expandable-accordion-card.component.html',
  styleUrl: './expandable-accordion-card.component.css'
})
export class ExpandableAccordionCardComponent implements OnInit{

  catalogItemTitle = input.required<string>();
  id = input.required<string>();
  isActive = input.required<boolean>();
  state: 'open' | 'closed' = 'closed';
  

  constructor(private expandedCard: ExpandedCardService){
  }

  ngOnInit(): void {

    this.expandedCard.selectedModule$.subscribe((activeId) => {
      if (activeId === this.id()){


        this.state = 'open';
      }
      else {

        switch (this.state === 'open') {
          case true: {
            this.state = 'closed';
            break;
          }
          case false: {
            break;}}


    }})

  }

  toggleExpand(){

    this.state = this.state === 'open' ? 'closed' : 'open';
    this.expandedCard.setActiveModule(this.id());

  }

}
