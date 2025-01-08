import { Component, input, signal } from '@angular/core';

import { ModuleConfigurationItem } from '../interfaces/module-content.config.model';

@Component({
  selector: 'app-module-navigation',
  standalone: true,
  imports: [],
  templateUrl: './module-navigation.component.html',
  styleUrl: './module-navigation.component.css'
})
export class ModuleNavigationComponent {

  configurationItem = input.required<ModuleConfigurationItem[]>();




}
