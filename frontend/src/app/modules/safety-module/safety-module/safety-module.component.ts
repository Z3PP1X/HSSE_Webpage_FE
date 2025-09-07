import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmplanComponent } from "../components/alarmplan/alarmplan.component";
import { ModuleNavigationComponent } from "../../../components/module-navigation/module-navigation/module-navigation.component";
import { SafetyModuleConfig } from '../safety-module.config';
import { FormComponent } from '../../../components/DynamicForm/Form/form/form.component';
import { AlarmplanDataService } from '../services/alarmplan-data.service';
import { AlarmplanFields } from '../components/alarmplan/alarmplan.model.interface';
import { PdfService } from '../../../global-services/pdf.generator.service';
import { PdfComponent } from '../components/pdf-gen/pdf/pdf.component';
import { FormOrchestrationService } from '../../../components/DynamicForm/Form-Building-Services/FormOrchestrationService';
import { FormGroup } from '@angular/forms';
import { Observable, Subject, of, EMPTY, combineLatest } from 'rxjs';
import { takeUntil, switchMap, tap, catchError, filter, delay, take, map, shareReplay } from 'rxjs/operators'; // Add 'map' here
import { environment } from '../../../../environments/environment';
import { ModuleNavigationService } from '../../../global-services/module-navigation-service/module-navigation.service';

@Component({
  selector: 'app-safety-module',
  standalone: true,
  imports: [
    AlarmplanComponent,
    ModuleNavigationComponent,
    FormComponent,
    CommonModule,
    PdfComponent
  ],
  templateUrl: './safety-module.component.html',
  styleUrl: './safety-module.component.css'
})
export class SafetyModuleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Use a single properly typed observable
  formReady$: Observable<{form: FormGroup, structure: any[]}> | null = null;
  formData: FormGroup | undefined = undefined; // Change to undefined instead of null

  @ViewChild(PdfComponent) pdfComponent!: PdfComponent;
  
  configurationItem = [SafetyModuleConfig]; 
  iconPath = "ehs-icons/safety-white.svg";
  formTitle = "Digitaler Alarmplan";
  activeMenuId = 'alarmplan';
  
  isLoading = false;
  error: string | null = null;
  alarmplanData: AlarmplanFields = {} as AlarmplanFields;
  showPdfComponent = false;

  constructor(
    private alarmplanDataService: AlarmplanDataService,
    private pdfService: PdfService,
    private formOrchestrationService: FormOrchestrationService, 
    private navService: ModuleNavigationService
  ) {}

  ngOnInit() {
    this.navService.initializeFromConfig(this.configurationItem);
    this.initializeAlarmplan();
  }

  /**
   * Initialize alarmplan by creating form
   */
  private initializeAlarmplan(): void {
    this.isLoading = true;
    this.error = null;

    const form$ = this.formOrchestrationService.generateForm(
      'alarmplan/emergency-planning/form_schema/'
    );

    const structure$ = this.formOrchestrationService.getFormQuestions();

    // Create a properly typed combined observable
    this.formReady$ = combineLatest([form$, structure$]).pipe(
      map(([form, structure]) => ({ form, structure })),
      filter(data => !!data.form && !!data.structure && data.structure.length > 0),
      tap(data => {
        console.log('Form and structure both ready:', data);
        console.log('Structure contains expandable categories:', 
          data.structure.filter((item: any) => item.expandable));
        this.isLoading = false;
      }),
      shareReplay(1),
      catchError(error => {
        console.error('Error initializing alarmplan:', error);
        this.error = 'Failed to load alarmplan configuration';
        this.isLoading = false;
        return EMPTY;
      })
    );

    // Subscribe to metadata for title
    this.formOrchestrationService.getFormMetadata().pipe(
      takeUntil(this.destroy$)
    ).subscribe(metadata => {
      if (metadata?.form_title) {
        this.formTitle = metadata.form_title;
      }
    });
  }

  /**
   * Handle form submission
   */
  handleFormSubmit(formValue: any): void {
    console.log('Form submitted with values:', formValue);
    
    // Transform and store the form data
    this.alarmplanDataService.updateFormData(formValue);
    this.showPdfComponent = true;

    // Wait for data to propagate through the observable chain
    this.alarmplanDataService.formData$.pipe(
        filter(data => data && Object.keys(data).length > 0), // Wait for actual data
        take(1), // Take only the first emission with data
        delay(100) // Small delay to ensure DOM updates
    ).subscribe(data => {
        console.log('Data propagated, generating PDF with:', data);
        this.generatePdfWithData();
    });
  }

  private async generatePdfWithData(): Promise<void> {
      if (this.pdfComponent) {
          this.pdfComponent.prepareForPdfGeneration();
          await this.pdfService.generatePDF('pdf-container', 'alarmplan.pdf');
          this.pdfComponent.cleanupAfterPdfGeneration();
          this.showPdfComponent = false;
      }
  }

  /**
   * Retry loading configuration
   */
  retryLoadConfig(): void {
    this.initializeAlarmplan();
  }

  /**
   * Get active menu based on activeMenuId
   */
  get activeMenu() {
    return this.configurationItem[0].menus?.find(
      menu => menu.menuId === this.activeMenuId
    );
  }

  /**
   * Get current form title from config or fallback
   */
  get dynamicFormTitle(): string {
    return this.formTitle; // Just use the static title for now
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}