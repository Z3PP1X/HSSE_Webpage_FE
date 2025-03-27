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
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

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

  @ViewChild(PdfComponent) pdfComponent!: PdfComponent;
  configurationItem = [SafetyModuleConfig]; 
  iconPath = "ehs-icons/safety-white.svg";
  formTitle = "Digitaler Alarmplan";
  activeMenuId = 'alarmplan';
  
  form$: Observable<FormGroup> | null = null;
  isLoading = false;
  error: string | null = null;
  alarmplanData: AlarmplanFields = {} as AlarmplanFields;
  showPdfComponent = false;

  constructor(
    private alarmplanDataService: AlarmplanDataService,
    private pdfService: PdfService,
    private formOrchestrationService: FormOrchestrationService
  ){}

  ngOnInit() {
    // Use default menu from config if available
    this.activeMenuId = this.configurationItem[0].defaultMenu || 'alarmplan';
    
    // Determine which form endpoint to use from the active menu
    const formEndpoint = this.findFormEndpoint('Digitaler Alarmplan');
    // ...rest of your existing code
  }
  
  // Get active menu based on activeMenuId
  get activeMenu() {
    return this.configurationItem[0].menus?.find(
      menu => menu.menuId === this.activeMenuId
    );
  }
  
  findFormEndpoint(formName: string): string | undefined {
    if (!this.activeMenu) return undefined;
    
    const formConfig = this.activeMenu.forms?.find(form => form.name === formName);
    return formConfig ? `${environment.apiBaseUrl}/${formConfig.path}` : undefined;
  }

  handleFormSubmit(formValue: any): void {
    console.log('Form submitted with values:', formValue);
    
    // Update the alarmplan data
    this.alarmplanDataService.updateFormData(formValue);
    this.showPdfComponent = true;
  
    // Give the component time to render
    setTimeout(async () => {
      if (this.pdfComponent) {
        this.pdfComponent.prepareForPdfGeneration();
  
        // Await PDF generation completion
        await this.pdfService.generatePDF('pdf-container', 'alarmplan.pdf');
  
        // Clean up immediately after completion
        this.pdfComponent.cleanupAfterPdfGeneration();
        this.showPdfComponent = false;
      }
    }, 300);
  }
  
  // Method to change active menu
  setActiveMenu(menuId: string) {
    this.activeMenuId = menuId;
    
    // Load default form for this menu
    if (this.activeMenu && this.activeMenu.forms.length > 0) {
      const defaultForm = this.activeMenu.forms[0];
      this.formTitle = defaultForm.name;
      
      const formEndpoint = this.findFormEndpoint(defaultForm.name);
      if (formEndpoint) {
        this.form$ = this.formOrchestrationService.generateForm(formEndpoint);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

