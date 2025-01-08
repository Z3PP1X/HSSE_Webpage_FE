import { Routes } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './modules/home-module/home/home.component';
import { HealthModuleComponent } from './modules/health-module/health-module/health-module.component';
import { SafetyModuleComponent } from './modules/safety-module/safety-module/safety-module.component';

export const routes: Routes = [
  { path: 'hsse', component: HomeComponent},
  { path: '', component: HomeComponent},
  { path: 'health', component: HealthModuleComponent},
  { path: 'safety', component: SafetyModuleComponent},
];
