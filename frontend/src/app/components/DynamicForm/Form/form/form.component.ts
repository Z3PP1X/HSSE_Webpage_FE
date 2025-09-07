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
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';

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
import { FormModelService } from '../../Form-Building-Services/FormModelService';


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
export class FormComponent implements OnInit, OnDestroy, OnChanges {

  Array = Array;
  payLoad: string = '';
  private destroy$ = new Subject<void>();

  formTitle = input.required<string>();
  questions: QuestionBase<any>[] = [];
  formReadyFlag = signal<boolean>(false);
  expandableCategories = signal<Map<string, FormGroupBase<any>>>(new Map());

  @Input() form!: FormGroup;
  @Input() formStructure: FormGroupBase<any>[] | QuestionBase<any>[] = [];

  /// Legacy ?
  @Input() metadata: any = null;
  @Output() formSubmit = new EventEmitter<any>();


  isLoading = signal(true);
  questionMap = signal<Map<string, QuestionBase<any>>>(new Map());
  formReady = signal(false);
  currentCategoryIndex: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('FormComponent ngOnChanges called with:', changes);
    
    // Check if both form and formStructure are available
    if (this.form && this.formStructure && this.formStructure.length > 0) {
      console.log('Both form and structure available in ngOnChanges');
      this.initializeFormWithStructure();
    }
  }

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private formModelService: FormModelService
  ) {}

  ngOnInit(): void {
    console.log('FormComponent ngOnInit - Form provided:', !!this.form);
    console.log('FormComponent ngOnInit - FormStructure length:', this.formStructure?.length || 0);
    console.log('FormComponent ngOnInit - FormStructure:', this.formStructure);
    
    if (!this.form) {
      console.log('No form provided - preparing form data');
      this.prepareFormData();
    } else {
      console.log('Form provided by parent - setting ready immediately');
      this.formReadyFlag.set(true);
      this.isLoading.set(false);
      
      if (this.formStructure && this.formStructure.length > 0) {
        console.log('Processing questions from structure');
        this.provideQuestions(this.formStructure);
        // Initialize expandable categories AFTER processing questions
        this.initializeExpandableCategories();
      }
      
      console.log('FormReadyFlag after setup:', this.formReadyFlag());
    }
    
    // Don't call initializeExpandableCategories here if form is provided
    // Only call it if no form is provided (handled in prepareFormData)
    if (!this.form) {
      this.initializeExpandableCategories();
    }
  }

  private initializeFormWithStructure(): void {
    console.log('Initializing form with structure');
    console.log('Form:', this.form);
    console.log('Structure:', this.formStructure);
    
    // Set form as ready
    this.formReadyFlag.set(true);
    this.isLoading.set(false);
    
    // Process questions from structure
    this.provideQuestions(this.formStructure);
    
    // Initialize expandable categories
    this.initializeExpandableCategories();
    
    // Force change detection
    this.cdr.detectChanges();
    
    console.log('Form initialization complete');
  }

  private initializeExpandableCategories(): void {
    console.log('Initializing expandable categories with structure:', this.formStructure);
    
    if (!this.formStructure || !this.isFormGroupBaseArray(this.formStructure)) {
      console.log('FormStructure is not a valid FormGroupBase array');
      return;
    }

    const expandableMap = new Map<string, FormGroupBase<any>>();
    
    this.formStructure.forEach(category => {
      console.log(`Checking category ${category.key}:`, {
        expandable: category.expandable,
        isCategory: category.isCategory,
        fields: category.fields?.length || 0
      });
      
      if (category.expandable && category.isCategory) {
        expandableMap.set(category.key, category);
        // Initialize instance count from current_instances or min_instances
        const initialCount = category.current_instances || category.min_instances || 1;
        this.formModelService.setCategoryInstanceCount(category.key, initialCount);
        console.log(`Set ${category.key} instance count to ${initialCount}`);
      }
    });
    
    // Update the signal
    this.expandableCategories.set(expandableMap);
    console.log('Final expandable categories map:', expandableMap);
    console.log('Expandable categories keys:', Array.from(expandableMap.keys()));
    
    // Force another change detection after setting expandable categories
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  isCategoryExpandable(categoryKey: string): boolean {
    const expandableMap = this.expandableCategories();
    const isExpandable = expandableMap.has(categoryKey);
    
    if (!isExpandable) {
      console.log(`Category ${categoryKey} is NOT expandable`);
      console.log('Available expandable categories:', Array.from(expandableMap.keys()));
      console.log('Current expandable map:', expandableMap);
    } else {
      console.log(`Category ${categoryKey} IS expandable`);
    }
    
    return isExpandable;
  }

canAddInstance(categoryKey: string): boolean {
  const category = this.expandableCategories().get(categoryKey);
  if (!category) return false;
  
  const currentCount = this.getCurrentInstanceCount(categoryKey);
  const maxInstances = category.max_instances || Infinity;
  return currentCount < maxInstances;
}

addInstance(categoryKey: string): void {
  console.log(`Adding instance to category: ${categoryKey}`);
  const category = this.expandableCategories().get(categoryKey);
  if (!category || !this.canAddInstance(categoryKey)) {
    console.log('Cannot add instance - category not found or limit reached');
    return;
  }
  
  // Find template fields from the original structure (those containing {index})
  // Since the API has already expanded them, we need to recreate the template
  const existingFields = category.fields.filter(field => 
    isQuestionBase(field) && field.key_template
  ) as QuestionBase<any>[];
  
  // Create template fields
  const templateFields = existingFields.map(field => ({
    ...field,
    key: `${field.key_template}_{index}`, // Recreate template format
    label: field.key_template || field.label
  }));
  
  console.log('Template fields for new instance:', templateFields);
  
  this.formModelService.addInstanceToExpandableCategory(categoryKey, templateFields)
    .subscribe(() => {
      console.log(`Successfully added instance to ${categoryKey}`);
      this.cdr.detectChanges();
    });
}

canRemoveInstance(categoryKey: string): boolean {
  const category = this.expandableCategories().get(categoryKey);
  return category ? this.formModelService.canRemoveInstance(category) : false;
}

getCurrentInstanceCount(categoryKey: string): number {
  return this.formModelService.getCategoryInstanceCount(categoryKey);
}

getMaxInstances(categoryKey: string): number {
  const category = this.expandableCategories().get(categoryKey);
  return category?.max_instances || Infinity;
}

removeInstance(categoryKey: string): void {
  if (!this.canRemoveInstance(categoryKey)) return;
  
  const currentCount = this.getCurrentInstanceCount(categoryKey);
  this.formModelService.removeInstanceFromExpandableCategory(categoryKey, currentCount);
  this.cdr.detectChanges();
}

isFormGroupBase(item: any): item is FormGroupBase<any> {
  return item && typeof item === 'object' && 'fields' in item && Array.isArray(item.fields);
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
    if (!this.questions || this.questions.length === 0) {
      return undefined;
    }

    // Try direct key match first
    let question = this.questions.find(q => q.key === key);
    if (question) return question;

    // Try extracting key from category.key format
    const keyPart = key.includes('.') ? key.split('.').pop() : key;
    question = this.questions.find(q => q.key === keyPart);
    
    return question;
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
