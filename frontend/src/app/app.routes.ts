import { Routes } from '@angular/router';

import { HomeComponent } from './modules/home-module/home/home.component';
import { HealthModuleComponent } from './modules/health-module/health-module/health-module.component';
import { SafetyModuleComponent } from './modules/safety-module/safety-module/safety-module.component';
import { FormComponent } from './components/DynamicForm/Form/form/form.component';
import { AlarmplanComponent } from './modules/safety-module/components/alarmplan/alarmplan.component';

export const routes: Routes = [
  { path: 'hsse', component: HomeComponent},
  { path: '', component: HomeComponent},
  { path: 'health', component: HealthModuleComponent},
  { path: 'safety', component: SafetyModuleComponent},
  { path: 'test', component: FormComponent},
  { path: 'alarmplan', component: AlarmplanComponent},
];
