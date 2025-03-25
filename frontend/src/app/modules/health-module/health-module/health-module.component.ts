import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ModuleNavigationComponent } from '../../../components/module-navigation/module-navigation/module-navigation.component';
import { FormComponent } from '../../../components/DynamicForm/Form/form/form.component';
import { HealthModuleConfig } from './health-module.config';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { QuestionBase } from '../../../components/DynamicForm/question-base';
import { FormOrchestrationService } from '../../../components/DynamicForm/Form-Building-Services/FormOrchestrationService';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-health-module',
  standalone: true,
  imports: [ModuleNavigationComponent, AsyncPipe, CommonModule, FormComponent], // Added FormComponent to imports
  providers: [],
  templateUrl: './health-module.component.html',
  styleUrl: './health-module.component.css'
})
export class HealthModuleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  moduleConfig = HealthModuleConfig;
  iconPath = "ehs-icons/health-white.svg";

  formTitle = "Unfallbericht";
  formCategories: string[] = ["General", "Medical Information", "Emergency Contacts"];
  
  questions$: Observable<QuestionBase<any>[]> = of([]);
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
      // Track loading state
      this.formOrchestrationService.isLoading()
        .pipe(takeUntil(this.destroy$))
        .subscribe(isLoading => this.isLoading = isLoading);

      // Track errors
      this.formOrchestrationService.getError()
        .pipe(takeUntil(this.destroy$))
        .subscribe(error => this.error = error);
      
      // Generate the form
      this.form$ = this.formOrchestrationService.generateForm(formEndpoint, "unfallberichtForm");
      
      // Get questions for the form
      this.questions$ = this.formOrchestrationService.getCurrentForm().pipe(
        takeUntil(this.destroy$),
        map(formGroup => {
          // Extract questions from the FormGroup
          // This implementation depends on how your FormOrchestrationService works
          // Assuming it has a method to get questions from a form
          return this.formOrchestrationService.getQuestionsFromForm(formGroup);
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Find appropriate endpoint for a form from the module configuration
   */
  private findFormEndpoint(formName: string): string | null {
    // Look through the config to find the matching form endpoint
    for (const module of this.moduleConfig) {
      if (module.title === formName) {
        return module.endpoint;
      }
      
      if (module.items) {
        for (const item of module.items) {
          if (item.title === formName) {
            return item.endpoint;
          }
        }
      }
    }
    
    // If no specific endpoint found, use the first available endpoint
    if (this.moduleConfig.length > 0) {
      const firstModule = this.moduleConfig[0];
      if (firstModule.endpoint) {
        return firstModule.endpoint;
      } else if (firstModule.items && firstModule.items.length > 0) {
        return firstModule.items[0].endpoint;
      }
    }
    
    return null;
  }

  /**
   * Reset the form to its initial state
   */
  resetForm(): void {
    this.formOrchestrationService.resetForm();
  }
}