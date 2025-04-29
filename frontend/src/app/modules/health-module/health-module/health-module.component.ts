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
import { ModuleNavigationService } from '../../../global-services/module-navigation-service/module-navigation.service';
import { tap } from 'rxjs/operators';
import { FormFrameComponent } from '../../../components/DynamicForm/form-frame/form-frame.component';
import { QuestionBase } from '../../../components/DynamicForm/question-base';
import { FormGroupBase } from '../../../components/DynamicForm/Form/form/form-group-base';

@Component({
  selector: 'app-health-module',
  standalone: true,
  imports: [ModuleNavigationComponent, CommonModule, FormComponent, FormFrameComponent],
  providers: [],
  templateUrl: './health-module.component.html',
  styleUrl: './health-module.component.css'
})
export class HealthModuleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  showForm = true;
  moduleConfig = [HealthModuleConfig];
  iconPath = "ehs-icons/health-white.svg";

  formTitle = "Unfallbericht";
  questions$: Observable<FormGroupBase<any>[] | QuestionBase<any>[]> |  null = null;
  form$: Observable<FormGroup> | null = null;
  isLoading = false;
  error: string | null = null;


  getObjectKeys(obj: object): string[] {
    return Object.keys(obj || {});
  }

  constructor(
    private formOrchestrationService: FormOrchestrationService,
    private navService: ModuleNavigationService
  ) {}

  ngOnInit(): void {

    this.navService.initializeFromConfig(this.moduleConfig);
    
    const formEndpoint = this.navService.findFormEndpoint(this.moduleConfig, 'Unfallbericht');
    
    if (formEndpoint) {
      
      this.form$ = this.formOrchestrationService.generateForm(formEndpoint).pipe(
        tap(form => {
          
          this.formOrchestrationService.getFormMetadata()
            .pipe(takeUntil(this.destroy$))
            .subscribe(metadata => {
             
              if (metadata?.form_title) {
                this.formTitle = metadata.form_title;
              }
            });
        })
        
      );

      this.questions$ = this.formOrchestrationService.getFormQuestions()
        .pipe(takeUntil(this.destroy$));
      
      
      this.formOrchestrationService.isLoading()
        .pipe(takeUntil(this.destroy$))
        .subscribe(isLoading => this.isLoading = isLoading);

      
      this.formOrchestrationService.getError()
        .pipe(takeUntil(this.destroy$))
        .subscribe(error => this.error = error);
    } else {
      this.error = `Form definition for "${this.formTitle}" not found in configuration`;
    }
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