import { Component, inject, OnInit } from '@angular/core';

import { AsyncPipe, CommonModule } from '@angular/common';

import { ModuleNavigationComponent } from '../../../components/module-navigation/module-navigation/module-navigation.component';
import { FormComponent } from '../../../components/DynamicForm/Form/form/form.component';

import { QuestionService } from '../../../components/DynamicForm/services/question.service';
import { QuestionBase } from '../../../components/DynamicForm/question-base';
import { Observable, of, Subscription } from 'rxjs';
import { map, tap } from 'rxjs';
import { MetadataService } from '../../../components/DynamicForm/services/model.metadata.service';

import { HealthModuleConfig } from './health-module.config';

@Component({
  selector: 'app-health-module',
  standalone: true,
  imports: [ ModuleNavigationComponent, FormComponent, AsyncPipe, CommonModule],
  providers: [QuestionService, MetadataService],
  templateUrl: './health-module.component.html',
  styleUrl: './health-module.component.css'
})
export class HealthModuleComponent implements OnInit{

  moduleConfig = HealthModuleConfig;
  iconPath = "ehs-icons/health-white.svg";

  formTitle = "Unfallbericht"
  formCategories: string[] = ["General", "Medical Information", "Emergency Contacts"];
  

  questions$: Observable<QuestionBase<any>[]> = of([]);

  private questionservice = inject(QuestionService);
  private dataset = inject(MetadataService);
  private subscription!: Subscription;

  ngOnInit(): void {

    this.subscription = this.dataset.getMetadata("http://127.0.0.1:8000/api/digitalfirstaid/meta/?format=json").subscribe({
      next: (data) => {
        console.log("This is the data")
        console.log(data)
        console.log("----")
        this.questions$ = this.questionservice.getQuestions(data);
      }
    });

  }

  ngOnDestroy(): void {

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

  }



}
