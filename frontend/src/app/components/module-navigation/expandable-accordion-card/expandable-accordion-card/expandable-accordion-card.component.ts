import { CommonModule } from '@angular/common';
import { Component, input, signal, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition, } from '@angular/animations';
import { ExpandedCardService } from '../services/expanded-card.service';
import { NavigationItem } from '../../interfaces/module-content.config.model';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarNavigationService } from '../../../../global-services/navbar-navigation/navbar-navigation.service';

@Component({
  selector: 'app-expandable-accordion-card',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  animations: [

    [
      trigger('openClose', [
        state(
          'open',
          style({
            height: '*',
            opacity: 1,
            visibility: 'visible',
          })
        ),
        state(
          'closed',
          style({
            height: '0px',
            opacity: 0,
            visibility: 'hidden',
          })
        ),
        transition('open <=> closed', [animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')]),
      ]),
    ],
  ],
  templateUrl: './expandable-accordion-card.component.html',
  styleUrl: './expandable-accordion-card.component.css'
})
export class ExpandableAccordionCardComponent implements OnInit {

  catalogItemTitle = input.required<string>();
  id = input.required<string>();
  isActive = input.required<boolean>();
  navigationItems = input<NavigationItem[]>([]);
  state: 'open' | 'closed' = 'closed';


  constructor(
    private expandedCard: ExpandedCardService,
    private navService: NavbarNavigationService
  ) {
  }

  ngOnInit(): void {

    this.expandedCard.selectedModule$.subscribe((activeId) => {
      if (activeId === this.id()) {


        this.state = 'open';
      }
      else {

        switch (this.state === 'open') {
          case true: {
            this.state = 'closed';
            break;
          }
          case false: {
            break;
          }
        }


      }
    })

  }

  toggleExpand() {
    if (this.state === 'open') {
      this.state = 'closed';
      this.expandedCard.setActiveModule(''); // Close
    } else {
      this.state = 'open';
      this.expandedCard.setActiveModule(this.id()); // Open me (closes others via subscription)
    }
  }

  handleLinkClick() {
    this.navService.closeDrawer();
  }

}
