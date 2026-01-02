import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmplanComponent } from "../components/alarmplan/alarmplan.component";
import { ModuleNavigationComponent } from "../../../components/module-navigation/module-navigation/module-navigation.component";
import { SafetyModuleConfig } from '../safety-module.config';
import { FormComponent } from '../../../components/DynamicForm/Form/form/form.component';
import { AlarmplanFields } from '../components/alarmplan/alarmplan.model.interface';
import { PdfService } from '../../../global-services/pdf.generator.service';
import { PdfComponent } from '../components/pdf-gen/pdf/pdf.component';
import { FormOrchestrationService } from '../../../components/DynamicForm/Form-Building-Services/FormOrchestrationService';
import { FormGroup } from '@angular/forms';
import { Observable, Subject, of, EMPTY, combineLatest } from 'rxjs';
import { takeUntil, switchMap, tap, catchError, filter, delay, take, map, shareReplay } from 'rxjs/operators'; // Add 'map' here
import { environment } from '../../../../environments/environment';
import { ModuleNavigationService } from '../../../global-services/module-navigation-service/module-navigation.service';
import { Router } from '@angular/router';
import { FormDataService } from '../../../global-services/form-data-service/form-data.service';

@Component({
  selector: 'app-safety-module',
  standalone: true,
  imports: [
    AlarmplanComponent,
    ModuleNavigationComponent,
    FormComponent,
    CommonModule,
    PdfComponent,
  ],
  templateUrl: './safety-module.component.html',
  styleUrl: './safety-module.component.css'
})
export class SafetyModuleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Use a single properly typed observable
  formReady$: Observable<{ form: FormGroup, structure: any[] }> | null = null;
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

  // State management for the process
  step: 'form' | 'review' = 'form';

  constructor(
    private formDataService: FormDataService,
    private pdfService: PdfService,
    private formOrchestrationService: FormOrchestrationService,
    private navService: ModuleNavigationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.navService.initializeFromConfig(this.configurationItem);
    this.initializeAlarmplan();
  }

  /**
   * Initialize alarmplan by creating form
   */
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
      map(([form, structure]: [any, any[]]) => ({ form: form as FormGroup, structure })),
      filter((data: { form: FormGroup, structure: any[] }) => !!data.form && !!data.structure && data.structure.length > 0),
      tap((data: { form: FormGroup, structure: any[] }) => {

        this.isLoading = false;
      }),
      shareReplay(1),
      catchError((error: any) => {
        console.error('❌ [SafetyModule] Error initializing alarmplan:', error);
        this.error = 'Failed to load alarmplan configuration: ' + (error.message || error);
        this.isLoading = false;
        return EMPTY;
      })
    );

    // Subscribe to metadata for title
    this.formOrchestrationService.getFormMetadata().pipe(
      takeUntil(this.destroy$)
    ).subscribe((metadata: any) => {
      if (metadata?.form_title) {
        this.formTitle = metadata.form_title;
      }
    });
    // Subscribe to trigger the pipeline (breaking the *ngIf deadlock in template)
    this.formReady$.pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /**
   * Handle form submission
   */
  handleFormSubmit(formValue: any): void {
    this.formDataService.setFormData(formValue);

    // Switch to review step instead of immediate generation
    this.step = 'review';
    // Ensure scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Confirm review and generate PDF
   */
  async onConfirmReview(): Promise<void> {
    this.isLoading = true;
    this.showPdfComponent = true;

    // Wait for view update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      await this.generatePdfWithData();
      this.router.navigate(['/success']);
    } catch (err) {
      console.error("PDF Generation failed", err);
      this.error = "Failed to generate PDF";
    } finally {
      this.isLoading = false;
    }
  }

  backToForm(): void {
    this.step = 'form';
  }

  private async generatePdfWithData(): Promise<void> {
    if (this.pdfComponent) {
      await this.pdfComponent.waitForData();
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