import { Component, OnInit } from '@angular/core';
import { AlarmplanComponent } from "../components/alarmplan/alarmplan.component";
import { ModuleNavigationComponent } from "../../../components/module-navigation/module-navigation/module-navigation.component";
import { SafetyModuleConfig } from '../safety-module.config';
import { FormComponent } from '../../../components/DynamicForm/Form/form/form.component';
import { QuestionBase } from '../../../components/DynamicForm/question-base';
import { QuestionService } from '../../../components/DynamicForm/services/question.service';
import { AlarmplanConfig } from './alarmplan.config';
import { AlarmplanDataService } from '../services/alarmplan-data.service';
import { AlarmplanFields } from '../components/alarmplan/alarmplan.model.interface';

@Component({
  selector: 'app-safety-module',
  standalone: true,
  imports: [AlarmplanComponent, ModuleNavigationComponent, FormComponent],
  templateUrl: './safety-module.component.html',
  styleUrl: './safety-module.component.css'
})
export class SafetyModuleComponent implements OnInit {
  configurationItem = SafetyModuleConfig;
  iconPath = "ehs-icons/safety-white.svg";
  formTitle = "Digitaler Alarmplan";
  formCategories = AlarmplanConfig.categories;
  
  questions: QuestionBase<string>[] = [];
  alarmplanData: AlarmplanFields = {} as AlarmplanFields;
  
  constructor(
    private questionService: QuestionService,
    private alarmplanDataService: AlarmplanDataService
  ){}

  ngOnInit() {
    this.questionService.getQuestions(AlarmplanConfig.questions).subscribe(questions => {
      this.questions = questions;
    });
    
    // Subscribe to form data changes
    this.alarmplanDataService.formData$.subscribe(data => {
      this.alarmplanData = data;
    });
  }
  
  handleFormSubmit(formData: any) {
    this.alarmplanDataService.updateFormData(formData);
  }
}