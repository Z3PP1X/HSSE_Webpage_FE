import { Component } from '@angular/core';
import { ModuleNavigationComponent } from '../../../components/module-navigation/module-navigation/module-navigation.component';

import { HealthModuleConfig } from '../health-module.config';

@Component({
  selector: 'app-health-module',
  standalone: true,
  imports: [ ModuleNavigationComponent],
  templateUrl: './health-module.component.html',
  styleUrl: './health-module.component.css'
})
export class HealthModuleComponent {

  moduleConfig = HealthModuleConfig;
  iconPath = "ehs-icons/health-white.svg";

}
