import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleNavigationComponent } from '../../../components/module-navigation/module-navigation/module-navigation.component';
import { FormComponent } from '../../../components/DynamicForm/Form/form/form.component';
import { HealthModuleConfig } from './health-module.config';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormOrchestrationService } from '../../../components/DynamicForm/Form-Building-Services/FormOrchestrationService';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-health-module',
  standalone: true,
  imports: [ModuleNavigationComponent, CommonModule, FormComponent],
  providers: [],
  templateUrl: './health-module.component.html',
  styleUrl: './health-module.component.css'
})
export class HealthModuleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  moduleConfig = [HealthModuleConfig];
  iconPath = "ehs-icons/health-white.svg";

  formTitle = "Unfallbericht";
  form$: Observable<FormGroup> | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private formOrchestrationService: FormOrchestrationService
  ) {}

  ngOnInit(): void {
    // Determine which form endpoint to use from the config
    const formEndpoint = this.findFormEndpoint('Unfallbericht');
    
    if (formEndpoint) {
      // Generate the form
      this.form$ = this.formOrchestrationService.generateForm(formEndpoint);
      
      // Track loading state
      this.formOrchestrationService.isLoading()
        .pipe(takeUntil(this.destroy$))
        .subscribe(isLoading => this.isLoading = isLoading);

      // Track errors
      this.formOrchestrationService.getError()
        .pipe(takeUntil(this.destroy$))
        .subscribe(error => this.error = error);
    } else {
      this.error = `Form definition for "${this.formTitle}" not found in configuration`;
    }
  }

  findFormEndpoint(formName: string): string | undefined {
    const forms = this.moduleConfig[0]?.forms;
    if (!forms) return undefined;
    
    const formConfig = forms.find(form => form.name === formName);
    return formConfig ? `${environment.apiBaseUrl}/${formConfig.path}` : undefined;
  }

  onFormSubmit(formValue: any): void {
    console.log('Form submitted with values:', formValue);
    // Implement submission logic here
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}