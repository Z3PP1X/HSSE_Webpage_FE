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
    private formOrchestrationService: FormOrchestrationService,
    private navService: ModuleNavigationService
  ) {}

  ngOnInit(): void {

    this.navService.initializeFromConfig(this.moduleConfig);
    
    const formEndpoint = this.navService.findFormEndpoint(this.moduleConfig, 'Unfallbericht');
    
    if (formEndpoint) {
      
      this.form$ = this.formOrchestrationService.generateForm(formEndpoint).pipe(
        tap(form => {
          // Try to update form title if available in the metadata
          this.formOrchestrationService.getFormMetadata()
            .pipe(takeUntil(this.destroy$))
            .subscribe(metadata => {
              if (metadata?.form_title) {
                this.formTitle = metadata.form_title;
              }
            });
        })
      );
      
      
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