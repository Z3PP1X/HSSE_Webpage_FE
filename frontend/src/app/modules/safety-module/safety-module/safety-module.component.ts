import { Component } from '@angular/core';
import { AlarmplanComponent } from "../components/alarmplan/alarmplan.component";
import { ModuleNavigationComponent } from "../../../components/module-navigation/module-navigation/module-navigation.component";
import { SafetyModuleConfig } from '../safety-module.config';

@Component({
  selector: 'app-safety-module',
  standalone: true,
  imports: [AlarmplanComponent, ModuleNavigationComponent],
  templateUrl: './safety-module.component.html',
  styleUrl: './safety-module.component.css'
})
export class SafetyModuleComponent {

  configurationItem = SafetyModuleConfig;
  iconPath = "ehs-icons/safety-white.svg";

}
