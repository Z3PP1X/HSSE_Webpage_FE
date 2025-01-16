import { CommonModule } from '@angular/common';
import { Component, input, HostBinding, signal, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition, } from '@angular/animations';
import { ActiveModuleService } from '../../../navbar/services/selected-module.service';

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
            height: '300px',
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
  isOpen = signal<boolean>(false);

  state: 'open' | 'closed' = 'closed';

  constructor( activeMenu: ActiveModuleService){
  }

  ngOnInit(): void {

  }

  toggleExpand(){

    this.state = this.state === 'open' ? 'closed' : 'open';
    this.isOpen.set(!this.isOpen())

  }

}
