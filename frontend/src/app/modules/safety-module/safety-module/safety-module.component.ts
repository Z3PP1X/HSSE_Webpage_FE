import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmplanComponent } from "../components/alarmplan/alarmplan.component";
import { SafetyModuleConfig } from '../safety-module.config';
import { DynamicFormComponent } from '../../../components/DynamicForm/components/dynamic-form/dynamic-form.component';
import { FormConfig } from '../../../components/DynamicForm/models/form-config.model';
import { AlarmplanFields, AddedContact, FirstAider, NextHospital } from '../components/alarmplan/alarmplan.model.interface';
import { PdfService } from '../../../global-services/pdf.generator.service';
import { PdfComponent } from '../components/pdf-gen/pdf/pdf.component';
import { Observable, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModuleNavigationService } from '../../../global-services/module-navigation-service/module-navigation.service';
import { Router } from '@angular/router';
import { FormDataService } from '../../../global-services/form-data-service/form-data.service';
import { LoggingService } from '../../../global-services/logging/logging.service';
import { ApiService } from '../../../global-services/api-service/api-service';
import { environment } from '../../../../environments/environment';

// Fallback demo config for development
import { ALARM_PLAN_FORM_CONFIG } from '../../../components/DynamicForm/demo-data';

@Component({
  selector: 'app-safety-module',
  standalone: true,
  imports: [
    AlarmplanComponent,
    DynamicFormComponent,
    CommonModule,
    PdfComponent,
  ],
  templateUrl: './safety-module.component.html',
  styleUrl: './safety-module.component.css'
})
export class SafetyModuleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private log: ReturnType<LoggingService['scoped']>;
  private apiService = inject(ApiService);

  // Form config - loaded from API or fallback to demo
  formConfig: FormConfig | null = null;

  @ViewChild(PdfComponent) pdfComponent!: PdfComponent;

  configurationItem = [SafetyModuleConfig];
  iconPath = "ehs-icons/safety-white.svg";
  formTitle = "Digitaler Alarmplan";
  activeMenuId = 'alarmplan';

  isLoading = true;
  error: string | null = null;
  alarmplanData: AlarmplanFields = {} as AlarmplanFields;
  showPdfComponent = false;

  // State management for the process
  step: 'form' | 'review' = 'form';

  // Zoom & Pan State
  zoomLevel = 0.65;
  zoomStep = 0.1;
  minZoom = 0.3;
  maxZoom = 1.35;

  isDragging = false;
  panX = 0;
  panY = 0;
  startX = 0;
  startY = 0;
  initialPanX = 0;
  initialPanY = 0;

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
    }
  }

  startDrag(event: MouseEvent) {
    if (this.zoomLevel > 0.3) {
      this.isDragging = true;
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.initialPanX = this.panX;
      this.initialPanY = this.panY;
      event.preventDefault();
    }
  }

  onDrag(event: MouseEvent) {
    if (this.isDragging) {
      const dx = event.clientX - this.startX;
      const dy = event.clientY - this.startY;
      this.panX = this.initialPanX + dx;
      this.panY = this.initialPanY + dy;
    }
  }

  stopDrag() {
    this.isDragging = false;
  }

  constructor(
    private formDataService: FormDataService,
    private pdfService: PdfService,
    private navService: ModuleNavigationService,
    private router: Router,
    private logger: LoggingService
  ) {
    this.log = this.logger.scoped('SafetyModule');
  }

  ngOnInit() {
    this.navService.initializeFromConfig(this.configurationItem);
    this.loadFormConfig();
  }

  /**
   * Load form configuration from API or fallback to demo data
   */
  private loadFormConfig(): void {
    this.isLoading = true;
    this.error = null;

    // In production, always fetch from API
    // In development, allow fallback to demo data
    this.apiService.get<FormConfig>('/alarmplan/emergency-planning/form_schema/?format=json').subscribe({
      next: (config) => {
        this.log.info('✅ Form config loaded from API', config);
        this.formConfig = config;
        this.isLoading = false;
      },
      error: (err) => {
        this.log.warn('⚠️ Failed to load form config from API', err);

        // In development, fallback to demo data
        if (!environment.production) {
          this.log.info('📦 Using demo data fallback');
          this.formConfig = ALARM_PLAN_FORM_CONFIG;
          this.isLoading = false;
        } else {
          this.error = 'Failed to load form configuration. Please try again.';
          this.isLoading = false;
        }
      }
    });
  }

  /**
   * Handle form submission from DynamicFormComponent
   */
  handleFormSubmit(formValue: any): void {
    this.log.info('📝 RAW FORM VALUE:', JSON.stringify(formValue, null, 2));
    this.log.info('📝 Form Submitted', formValue);

    try {
      const mappedData = this.mapFormToModel(formValue);
      this.log.info('🗺️ MAPPED DATA:', JSON.stringify(mappedData, null, 2));
      this.log.info('🗺️ Mapped Data', mappedData);

      this.formDataService.setAlarmplanFields(mappedData);
      this.step = 'review';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      this.log.error('❌ Mapping failed', err);
      this.error = "Failed to process form data.";
    }
  }

  private mapFormToModel(form: any): AlarmplanFields {
    const contacts: AddedContact[] = [];

    // Map "Wichtige Kontakte" to AddedContacts
    const important = form['Wichtige Kontakte'] || {};

    if (important['Wichtige Kontakte_Name des Branch Managers']) {
      contacts.push({
        name: important['Wichtige Kontakte_Name des Branch Managers'],
        email: important['Wichtige Kontakte_Email des Branch Managers'],
        contactClass: 'BranchManager'
      });
    }
    if (important['Wichtige Kontakte_Name des Geschaftsführers']) {
      contacts.push({
        name: important['Wichtige Kontakte_Name des Geschaftsführers'],
        email: important['Wichtige Kontakte_Email des Geschäftsführers'],
        contactClass: 'Management'
      });
    }


    const fireHelpers = form['Brandschutzhelfer'] || [];

    if (Array.isArray(fireHelpers)) {
      fireHelpers.forEach((helper: any, index: number) => {


        const nameKey = `Brandschutzhelfer_Name_${index}`;
        const emailKey = `Brandschutzhelfer_Email_${index}`;

        if (helper[nameKey]) {
          contacts.push({
            name: helper[nameKey],
            email: helper[emailKey],
            contactClass: 'SafetyAdvisor'
          });
        }
      });
    }

    // Map First Aiders
    const firstAiders: FirstAider[] = [];
    const helpers = form['Ersthelfer'] || [];
    if (Array.isArray(helpers)) {
      helpers.forEach((h: any, i: number) => {
        const nameKey = `Ersthelfer_Name_${i}`;
        const phoneKey = `Ersthelfer_Telefonnummer_${i}`;

        if (h[nameKey]) {
          firstAiders.push({
            name: h[nameKey],
            phoneNumber: h[phoneKey] || ''
          });
        }
      });
    }

    // Map Hospital
    const hospitalGroup = form['Nächstes Krankenhaus'] || {};
    const nextHospital: NextHospital = {
      name: hospitalGroup['Nächstes Krankenhaus_Name des Krankenhauses'],
      street: hospitalGroup['Nächstes Krankenhaus_Straße und Hausnummer'],
      zipcode: hospitalGroup['Nächstes Krankenhaus_Postleitzahl'],
      city: '', // Form doesn't have city?
      houseNumber: '' // Form combines Street/Number or maps differently?
    };

    return {
      costCenter: form['Branch']?.['alarmplan_RelatedBranch'],
      assemblyPoint: form['Sammelplatz']?.['Sammelplatz_Sammelplatz'],
      poisonEmergencyCall: important['Wichtige Kontakte_Nummer des Giftnotrufs'],
      firstAiderDict: firstAiders,
      addedContact: contacts,
      nextHospital: nextHospital
    };
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
      this.log.error("PDF Generation failed", err);
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
    this.loadFormConfig();
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
    return this.formTitle;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}