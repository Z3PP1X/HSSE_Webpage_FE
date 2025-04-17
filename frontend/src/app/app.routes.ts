import { Routes } from '@angular/router';

import { HomeComponent } from './modules/home-module/home/home.component';
import { HealthModuleComponent } from './modules/health-module/health-module/health-module.component';
import { SafetyModuleComponent } from './modules/safety-module/safety-module/safety-module.component';
import { FormComponent } from './components/DynamicForm/Form/form/form.component';
import { AlarmplanComponent } from './modules/safety-module/components/alarmplan/alarmplan.component';
import { FormFrameComponent } from './components/DynamicForm/form-frame/form-frame.component';

export const routes: Routes = [
  { path: 'hsse', component: HomeComponent},
  { path: '', component: HomeComponent},
  { path: 'health', component: HealthModuleComponent},
  { path: 'safety', component: SafetyModuleComponent},
  { path: 'test', component: FormFrameComponent},
  { path: 'alarmplan', component: AlarmplanComponent},
];
