import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmplanComponent } from "../components/alarmplan/alarmplan.component";
import { SafetyModuleConfig } from '../safety-module.config';
import { DynamicFormComponent } from '../../../components/DynamicForm/components/dynamic-form/dynamic-form.component';
import { ALARM_PLAN_FORM_CONFIG } from '../../../components/DynamicForm/demo-data';
import { AlarmplanFields, AddedContact, FirstAider, NextHospital } from '../components/alarmplan/alarmplan.model.interface';
import { PdfService } from '../../../global-services/pdf.generator.service';
import { PdfComponent } from '../components/pdf-gen/pdf/pdf.component';
import { Observable, Subject } from 'rxjs';
import { ModuleNavigationService } from '../../../global-services/module-navigation-service/module-navigation.service';
import { Router } from '@angular/router';
import { FormDataService } from '../../../global-services/form-data-service/form-data.service';
import { LoggingService } from '../../../global-services/logging/logging.service';

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

  // New Config
  formConfig = ALARM_PLAN_FORM_CONFIG;

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
    private navService: ModuleNavigationService,
    private router: Router,
    private logger: LoggingService
  ) {
    this.log = this.logger.scoped('SafetyModule');
  }

  ngOnInit() {
    this.navService.initializeFromConfig(this.configurationItem);
    // No need to load form from backend anymore, we use static config
  }

  /**
   * Handle form submission from DynamicFormComponent
   */
  handleFormSubmit(formValue: any): void {
    this.log.info('📝 Form Submitted', formValue);

    try {
      const mappedData = this.mapFormToModel(formValue);
      this.log.info('🗺️ Mapped Data', mappedData);

      this.formDataService.setFormData(mappedData);
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

    // Map "Brandschutzhelfer" (assuming array)
    // Note: Model doesn't have explicit FireSafetyHelper, using SafetyAdvisor or similar?
    // Or we just add them with a custom or existing class if allowed.
    // Based on available types: "BranchManager" | "Management" | "EnvironmentalAdvisor" | "SafetyAdvisor" | "QualityManagement" | "CompanyDoctor"
    // Let's use 'SafetyAdvisor' for now as a fallback or if it fits.
    const fireHelpers = form['Brandschutzhelfer'] || [];
    // fireHelpers is an array of objects
    if (Array.isArray(fireHelpers)) {
      fireHelpers.forEach((helper: any, index: number) => {
        // keys might be Brandschutzhelfer_Name_0 etc. if they were flattened in the form value?
        // The DynamicForm produces structured objects if it's a FormArray of FormGroups.
        // FormBuilderService:
        // createCategoryInstance -> group[effectiveKey]
        // Effective key is 'Brandschutzhelfer_Name_{index}'.
        // So the object inside the array looks like:
        // { "Brandschutzhelfer_Name_0": "...", "Brandschutzhelfer_Email_0": "..." }
        // This is a bit tricky since the key changes with index.

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
    // this.initializeAlarmplan(); // Deprecated
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