import { Component, input, signal } from '@angular/core';

import { ModuleConfigurationItem } from '../interfaces/module-content.config.model';
import { ExpandableAccordionCardComponent } from "../expandable-accordion-card/expandable-accordion-card/expandable-accordion-card.component";

@Component({
  selector: 'app-module-navigation',
  standalone: true,
  imports: [ExpandableAccordionCardComponent],
  templateUrl: './module-navigation.component.html',
  styleUrl: './module-navigation.component.css'
})
export class ModuleNavigationComponent {

  configurationItem = input.required<ModuleConfigurationItem[]>();


  iconPath = input.required<string>();




}
