import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  input,
  Output,
  EventEmitter,
  Signal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';

import { ChangeDetectorRef } from '@angular/core';

import { QuestionBase } from '../../question-base';
import { FormGroupBase } from './form-group-base';
import { isFormGroupBase } from './form-group-base';
import { isQuestionBase } from '../../question-base';



import { FormQuestionComponent } from '../../Form-Question/form-question/form-question.component';
import { ApiService } from '../../../../global-services/ajax-service/ajax.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormQuestionComponent,
    MatStepperModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnDestroy {
  payLoad: string = '';
  private destroy$ = new Subject<void>();

  formTitle = input.required<string>();
  questions: QuestionBase<any>[] = [];
  formReadyFlag = signal<boolean>(false);

  @Input() form!: FormGroup;
  @Input() formStructure: FormGroupBase<any>[] | QuestionBase<any>[] = [];

  /// Legacy ?
  @Input() metadata: any = null;
  @Output() formSubmit = new EventEmitter<any>();


  isLoading = signal(true);
  questionMap = signal<Map<string, QuestionBase<any>>>(new Map());
  formReady = signal(false);
  currentCategoryIndex: number = 0;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.prepareFormData();
  }

  private async prepareFormData() {
    try {
      
      this.isLoading.set(true);
      this.formReadyFlag.set(false);
      const formData = await this.loadFormData();
      
      if (formData === true) {
        
        this.provideQuestions(this.formStructure);
        console.log(`Processed ${this.questions.length} questions`);
        
        const questionMap = new Map<string, QuestionBase<any>>();
        this.questions.forEach(q => {
          questionMap.set(q.key, q);
        });
        this.questionMap.set(questionMap);

        console.log("Question map: ", this.questionMap())
        
        this.formReady.set(true);
        this.formReadyFlag.set(true);
        
        console.log("Form: ", this.form)
        console.log("Form Structure: ", this.formStructure)
        console.log("Metadata: ", this.metadata)
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error preparing form data:', error);
    } finally {
      // Always update loading state
      this.isLoading.set(false);
    }
  }

  private async loadFormData(): Promise<any> {
    if (!this.formStructure) {
      throw new Error('Form structure is not provided');
    }
    if (!this.form) {
      throw new Error('Form is not provided');
    }
    if (this.formStructure.length === 0) {
      throw new Error('Form structure is empty');
    }

    if (this.formStructure.length > 0) {
      return true;
    }


  }

  private provideQuestions(formStructure : FormGroupBase<any>[] | QuestionBase<any>[]): void{

    if (this.isFormGroupBaseArray(formStructure)){

      console.log("Form Structure is an array of FormGroupBase")

      for (const category of formStructure) {

        console.log("Category: ", category)

        category.fields.forEach((field) => {
          console.log("Field: ", field)
          if (isQuestionBase(field)) {
            console.log("Field is a QuestionBase: ", field)
            this.questions.push(field);
          }
        });
      }

    } else{
      formStructure.forEach(question => {
        if (isQuestionBase(question)) {
          this.questions.push(question);
        }
      })
    }

  }


  getQuestionDebugInfo(category: string, controlName: string): string {
    const fullKey = `${category}.${controlName}`;
    const matchingQuestion = this.getQuestionForKey(fullKey);

    return `Form control: ${fullKey}, Question found: ${
      matchingQuestion ? 'Yes' : 'No'
    }`;
  }


  formCategories(): string[] {
    if (!this.form) return [];
    return Object.keys(this.form.controls).filter(
      (key) => this.form.get(key) instanceof FormGroup
    );
  }

  getQuestionForKey(key: string): QuestionBase<any> | undefined {
    // First try direct lookup from map
    const question = this.questionMap().get(key);
    if (question) {
      return question;
    }

    return undefined

  }

  getControlKeys(category: string): string[] {
    const controls = (this.form?.get(category) as FormGroup)?.controls;
    return controls ? Object.keys(controls) : [];
  }

  isFormGroupBaseArray(arr: any[]): arr is FormGroupBase<any>[] {
    return Array.isArray(arr) && arr.every(item => isFormGroupBase(item));
  }
  
  private buildParams(
    paramMap: Record<string, string>,
    value: any
  ): HttpParams {
    let params = new HttpParams();
    Object.entries(paramMap).forEach(([param, formKey]) => {
      const paramValue = this.form.get(formKey)?.value;
      if (paramValue !== null && paramValue !== undefined) {
        params = params.set(param, paramValue);
      }
    });
    return params;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (!this.form || !this.form.valid) {
      console.error('Form is invalid or not available');
      return;
    }

    const formData = this.form.getRawValue();
    this.payLoad = JSON.stringify(formData);
    console.log('Form submitted:', this.payLoad);
    this.formSubmit.emit(formData);
  }

  getQuestionsByCategory(category: string) {
    return (
      this.questions?.filter((question) => question.category === category) || []
    );
  }

  isCategoryComplete(category: string): boolean {
    if (!this.form) return false;

    const questionsInCategory = this.getQuestionsByCategory(category);
    if (questionsInCategory.length === 0) {
      return false;
    }

    return questionsInCategory.every((question) => {
      const control = this.form.get(question.key);
      return control && control.valid && control.value;
    });
  }

  nextCategory(): void {
    const categories = this.formCategories();
    if (this.currentCategoryIndex < categories.length - 1) {
      this.currentCategoryIndex++;
    }
  }

  previousCategory(): void {
    if (this.currentCategoryIndex > 0) {
      this.currentCategoryIndex--;
    }
  }

  selectCategory(index: number): void {
    if (index >= 0 && index < this.formCategories().length) {
      this.currentCategoryIndex = index;
    }
  }

  getCurrentCategory(): string {
    console.log("Current Category Index: ", this.formCategories()[this.currentCategoryIndex])
    return this.formCategories()[this.currentCategoryIndex] || '';
  }

  getProgressValue(): number {
    const categories = this.formCategories();
    return categories.length > 0 ? ((this.currentCategoryIndex + 1) / categories.length) * 100 : 0;
  }

  humanizeCategory(category: string): string {
    
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
