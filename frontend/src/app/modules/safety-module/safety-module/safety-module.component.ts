// safety-module.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmplanComponent } from "../components/alarmplan/alarmplan.component";
import { ModuleNavigationComponent } from "../../../components/module-navigation/module-navigation/module-navigation.component";
import { SafetyModuleConfig } from '../safety-module.config';
import { FormComponent } from '../../../components/DynamicForm/Form/form/form.component';
import { QuestionBase } from '../../../components/DynamicForm/question-base';
import { QuestionService } from '../../../components/DynamicForm/services/question.service';
import { AlarmplanConfig } from './alarmplan.config';
import { AlarmplanDataService } from '../services/alarmplan-data.service';
import { AlarmplanFields } from '../components/alarmplan/alarmplan.model.interface';
import { PdfService } from '../../../global-services/pdf.generator.service';
import { PdfComponent } from '../components/pdf-gen/pdf/pdf.component';


@Component({
  selector: 'app-safety-module',
  standalone: true,
  imports: [
    AlarmplanComponent, 
    ModuleNavigationComponent, 
    FormComponent,
    CommonModule,
    PdfComponent  // Import the PDF component
  ],
  templateUrl: './safety-module.component.html',
  styleUrl: './safety-module.component.css'
})
export class SafetyModuleComponent implements OnInit {

  @ViewChild(PdfComponent) pdfComponent!: PdfComponent;
  configurationItem = SafetyModuleConfig;
  iconPath = "ehs-icons/safety-white.svg";
  formTitle = "Digitaler Alarmplan";
  formCategories = AlarmplanConfig.categories;
  
  questions: QuestionBase<string>[] = [];
  alarmplanData: AlarmplanFields = {} as AlarmplanFields;
  showPdfComponent = false;
  
  constructor(
    private questionService: QuestionService,
    private alarmplanDataService: AlarmplanDataService,
    private pdfService: PdfService
  ){}

  ngOnInit() {
    this.questionService.getQuestions(AlarmplanConfig.questions).subscribe(questions => {
      this.questions = questions;
    });
    
    
    this.alarmplanDataService.formData$.subscribe(data => {
      this.alarmplanData = data;
    });
  }
  
  handleFormSubmit(formData: any) {
    // Update the data service with form data
    this.alarmplanDataService.updateFormData(formData);
    
    // Make PDF component visible
    this.showPdfComponent = true;
    
    // Give the component time to render
    setTimeout(() => {
        if (this.pdfComponent) {
            // Prepare component for PDF generation
            this.pdfComponent.prepareForPdfGeneration();
            
            // Generate the PDF
            this.pdfService.generatePDF('pdf-container', 'alarmplan.pdf');
            
            // Clean up after PDF generation
            setTimeout(() => {
                this.pdfComponent.cleanupAfterPdfGeneration();
                this.showPdfComponent = false;
            }, 500);
        }
    }, 1000);
}
}