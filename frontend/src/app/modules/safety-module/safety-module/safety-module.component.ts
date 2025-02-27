import { Component, OnInit } from '@angular/core';
import { AlarmplanComponent } from "../components/alarmplan/alarmplan.component";
import { ModuleNavigationComponent } from "../../../components/module-navigation/module-navigation/module-navigation.component";
import { SafetyModuleConfig } from '../safety-module.config';
import { FormComponent } from '../../../components/DynamicForm/Form/form/form.component';
import { QuestionBase } from '../../../components/DynamicForm/question-base';
import { QuestionService } from '../../../components/DynamicForm/services/question.service';
import { AlarmplanConfig } from './alarmplan.config';

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

  questions: QuestionBase<string>[] = [];

  constructor(private questionService: QuestionService){}

  ngOnInit() {
    this.questionService.getQuestions(AlarmplanConfig.questions).subscribe(questions => {
      this.questions = questions;
    });
  }}
