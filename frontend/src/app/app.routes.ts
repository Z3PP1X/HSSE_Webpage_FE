import { Routes } from '@angular/router';

import { HomeComponent } from './modules/home-module/home/home.component';
import { HealthModuleComponent } from './modules/health-module/health-module/health-module.component';
import { SafetyModuleComponent } from './modules/safety-module/safety-module/safety-module.component';
import { FormComponent } from './components/DynamicForm/Form/form/form.component';
import { AlarmplanComponent } from './modules/safety-module/components/alarmplan/alarmplan.component';
import { FormFrameComponent } from './components/DynamicForm/form-frame/form-frame.component';
import { ContactComponent } from './modules/home-module/contact/contact.component';
import { SupportComponent } from './modules/home-module/support/support.component';
import { SuccessComponent } from './modules/safety-module/success/success.component';

export const routes: Routes = [

    { path: 'hsse', component: HomeComponent },
    { path: '', component: HomeComponent },
    { path: 'health', component: HealthModuleComponent },

    // Safety Module Routes
    { path: 'safety/:menuId/:action', component: SafetyModuleComponent },
    { path: 'safety/:menuId', component: SafetyModuleComponent },
    { path: 'safety', component: SafetyModuleComponent },

    { path: 'test', component: FormFrameComponent },
    { path: 'alarmplan', component: AlarmplanComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'support', component: SupportComponent },
    { path: 'documentation', redirectTo: '/support', pathMatch: 'full' },
    { path: 'activity', redirectTo: '/hsse', pathMatch: 'full' },
    { path: 'success', component: SuccessComponent }

];
