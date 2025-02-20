import { Component } from '@angular/core';
import { AccountModuleConfig } from './account-module.config';
import { ModuleNavigationComponent } from '../../../components/module-navigation/module-navigation/module-navigation.component';

@Component({
  selector: 'app-account-module',
  standalone: true,
  imports: [ModuleNavigationComponent],
  templateUrl: './account-module.component.html',
  styleUrl: './account-module.component.css'
})
export class AccountModuleComponent {

  iconPath = "ehs-icons/person-white.svg";
  configurationItem = AccountModuleConfig;



}
