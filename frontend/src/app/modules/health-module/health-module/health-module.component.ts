import { Component, inject, OnInit } from '@angular/core';

import { AsyncPipe, CommonModule } from '@angular/common';

import { ModuleNavigationComponent } from '../../../components/module-navigation/module-navigation/module-navigation.component';
import { FormComponent } from '../../../components/DynamicForm/Form/form/form.component';


import { QuestionBase } from '../../../components/DynamicForm/question-base';
import { Observable, of, Subscription } from 'rxjs';
import { map, tap } from 'rxjs';


import { HealthModuleConfig } from './health-module.config';

@Component({
  selector: 'app-health-module',
  standalone: true,
  imports: [ ModuleNavigationComponent, AsyncPipe, CommonModule],
  providers: [],
  templateUrl: './health-module.component.html',
  styleUrl: './health-module.component.css'
})
export class HealthModuleComponent implements OnInit{

  moduleConfig = HealthModuleConfig;
  iconPath = "ehs-icons/health-white.svg";

  formTitle = "Unfallbericht"
  formCategories: string[] = ["General", "Medical Information", "Emergency Contacts"];
  

  questions$: Observable<QuestionBase<any>[]> = of([]);


  ngOnInit(): void {

    
     
  }

  ngOnDestroy(): void {

    

  }



}
