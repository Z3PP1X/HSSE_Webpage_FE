import { Component, Input, OnInit, OnDestroy, input, Output, EventEmitter, Signal, signal, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';

import { QuestionBase } from '../../question-base';
import { FormGroupBase } from './form-group-base';
import { isFormGroupBase } from './form-group-base';
import { isQuestionBase } from '../../question-base';

import { FormQuestionComponent } from '../../Form-Question/form-question/form-question.component';
import { ApiService } from '../../../../global-services/api-service/api-service'; // Update this import
import { Subject, Observable, startWith, map } from 'rxjs';
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
  // Add form state tracking
  private formStateCache = new Map<string, any>();

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

  // ADD helper near top of class
  private questionLookup = new Map<string, Map<string, QuestionBase<any>>>();

  private ensureCategoryBucket(cat: string) {
    if (!this.questionLookup.has(cat)) this.questionLookup.set(cat, new Map());
    return this.questionLookup.get(cat)!;
  }

  private normalizeInstanceKey(key: string): string {
    // replace {index} with a digit if control exists, default 1
    if (key.includes('{index}')) return key.replace('{index}', '1');
    return key;
  }

  // Add missing ngOnDestroy method
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Add type guard for FormGroupBase array
  private isFormGroupBaseArray(items: FormGroupBase<any>[] | QuestionBase<any>[]): items is FormGroupBase<any>[] {
    return items.length > 0 && isFormGroupBase(items[0]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formStructure'] && this.formStructure?.length && !this.formReadyFlag()) {
      this.provideQuestions(this.formStructure);
      this.initializeExpandableCategories();
      this.formReadyFlag.set(true);
      this.cdr.detectChanges();
    }
  }

  constructor(
    private apiService: ApiService, // This should now work
    private cdr: ChangeDetectorRef,
    private formModelService: FormModelService
  ) {}

  ngOnInit(): void {
    console.log('🚨 FormComponent ngOnInit - FORCED');
    console.log('🚨 FormStructure:', this.formStructure);
    
    // FORCE provideQuestions call
    if (this.formStructure?.length > 0) {
      console.log('🚨 FORCING provideQuestions - structure has', this.formStructure.length, 'items');
      this.provideQuestions(this.formStructure);
    } else {
      console.log('🚨 No formStructure to process');
    }

    // Continue with rest of initialization
    if (this.form && this.formStructure?.length > 0) {
      console.log('Processing questions from structure');
      this.initializeExpandableCategories();
    }
    
    console.log('FormReadyFlag after setup:', this.formReadyFlag());
    
    if (!this.form) {
      this.initializeExpandableCategories();
    }
    
    console.log('🚨 Final questionLookup keys:', Array.from(this.questionLookup.keys()));
  }

  private async processQuestionsFromStructure(): Promise<void> {
    // Extract all questions from the FormGroupBase structure
    const allQuestions: QuestionBase<any>[] = [];
    
    this.formStructure.forEach(item => {
      if (isFormGroupBase(item) && item.fields) {
        item.fields.forEach(field => {
          if (isQuestionBase(field)) {
            // Ensure the field has the category information
            field.category = item.key;
            allQuestions.push(field);
          }
        });
      } else if (isQuestionBase(item)) {
        allQuestions.push(item);
      }
    });

    console.log('🔄 Extracted questions for lookup:', allQuestions);
    
    // Now call provideQuestions with the flattened structure
    this.provideQuestionsFromArray(allQuestions);
  }

  private provideQuestionsFromArray(questions: QuestionBase<any>[]): void {
    console.log('🔄 provideQuestionsFromArray called with:', questions);
    this.questionLookup.clear();

    questions.forEach(question => {
      const category = question.category || 'default';
      const bucket = this.ensureCategoryBucket(category);
      console.log('➕ Adding question to bucket:', {
        category,
        questionKey: question.key,
        fieldType: question.field_type
      });
      bucket.set(question.key, question);
    });

    console.log('📊 Final questionLookup state:', {
      categories: Array.from(this.questionLookup.keys()),
      details: Array.from(this.questionLookup.entries()).map(([cat, bucket]) => ({
        category: cat,
        questionKeys: Array.from(bucket.keys())
      }))
    });
  }

  private initializeFormWithStructure(): void {
    this.provideQuestions(this.formStructure);
    this.initializeExpandableCategories();
    this.formReadyFlag.set(true);
    this.isLoading.set(false);
    this.cdr.detectChanges();
  }

  private initializeExpandableCategories(): void {
    console.log('Initializing expandable categories with structure:', this.formStructure);

    if (!this.formStructure || !this.isFormGroupBaseArray(this.formStructure)) {
      console.log('FormStructure is not a valid FormGroupBase array');
      return;
    }

    const expandableMap = new Map<string, FormGroupBase<any>>();

    this.formStructure.forEach((category: FormGroupBase<any>) => {
      console.log(`Checking category ${category.key}:`, {
        expandable: category.expandable,
        isCategory: category.isCategory,
        fields: category.fields?.length || 0
      });

      if (category.expandable && category.isCategory) {
        expandableMap.set(category.key, category);
        // Initialize instance count from current_instances or min_instances
        const initialCount = (category as any).current_instances || (category as any).min_instances || 1;
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
    const maxInstances = (category as any).max_instances || Infinity;
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
    const existingFields = category.fields.filter((field: QuestionBase<any> | FormGroupBase<any>) =>
      isQuestionBase(field) && (field as any).key_template
    ) as QuestionBase<any>[];

    // Create template fields
    const templateFields = existingFields.map(field => ({
      ...field,
      key: `${(field as any).key_template}_{index}`, // Recreate template format
      label: (field as any).key_template || field.label
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
    return (category as any)?.max_instances || Infinity;
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

  private provideQuestions(data: FormGroupBase<any>[] | QuestionBase<any>[]): void {
    console.log('🚨 provideQuestions CALLED with data:', data);
    console.log('🚨 Data analysis:', {
      isArray: Array.isArray(data),
      length: data.length,
      firstItem: data[0],
      firstItemIsFormGroup: data[0] ? isFormGroupBase(data[0]) : false
    });
    
    this.questionLookup.clear();
  
    data.forEach((item, index) => {
      console.log(`🚨 Processing item ${index}:`, item);
      
      if (isFormGroupBase(item)) {
        console.log('📦 FormGroupBase detected:', item.key, 'with fields:', item.fields?.length);
        const bucket = this.ensureCategoryBucket(item.key);
        
        if (item.fields && Array.isArray(item.fields)) {
          item.fields.forEach((field, fieldIndex) => {
            console.log(`  Field ${fieldIndex}:`, field);
            
            if (isQuestionBase(field)) {
              console.log('  ➕ Adding question to bucket:', field.key);
              bucket.set(field.key, field);
            } else {
              console.log('  ❌ Field is not QuestionBase');
            }
          });
        }
      } else if (isQuestionBase(item)) {
        console.log('📝 Standalone QuestionBase detected:', item.key);
        const category = item.category || 'default';
        const bucket = this.ensureCategoryBucket(category);
        bucket.set(item.key, item);
      } else {
        console.log('❌ Item is neither FormGroupBase nor QuestionBase');
      }
    });
  
    console.log('🚨 Final questionLookup state:', {
      categories: Array.from(this.questionLookup.keys()),
      details: Array.from(this.questionLookup.entries()).map(([cat, bucket]) => ({
        category: cat,
        questionKeys: Array.from(bucket.keys())
      }))
    });
  }

  getQuestionForKey(controlName: string, category?: string): QuestionBase<any> | undefined {
    const cat = category || this.getCurrentCategory();
    const bucket = this.questionLookup.get(cat);
    
    // DEBUG: Log the lookup attempt
    console.log('🔍 getQuestionForKey called:', {
      controlName,
      category: cat,
      bucketExists: !!bucket,
      bucketKeys: bucket ? Array.from(bucket.keys()) : [],
      questionLookupKeys: Array.from(this.questionLookup.keys())
    });
    
    if (!bucket) {
      console.log('❌ No bucket found for category:', cat);
      return undefined;
    }
    
    // Try exact match first
    if (bucket.has(controlName)) {
      console.log('✅ Found exact match for:', controlName);
      return bucket.get(controlName);
    }
    
    // Try without category prefix
    const leafKey = controlName.includes('.') ? controlName.split('.').pop()! : controlName;
    if (bucket.has(leafKey)) {
      console.log('✅ Found leaf match for:', leafKey);
      return bucket.get(leafKey);
    }
    
    // Fallback: attempt template pattern match
    for (const q of bucket.values()) {
      if (q.key.includes('{index}')) {
        const pattern = q.key.replace('{index}', '\\d+');
        if (new RegExp(`^${pattern}$`).test(controlName) || new RegExp(`^${pattern}$`).test(leafKey)) {
          console.log('✅ Found pattern match for:', controlName, 'with pattern:', pattern);
          return q;
        }
      }
    }
    
    console.log('❌ No match found for:', controlName, 'in bucket:', Array.from(bucket.keys()));
    return undefined;
  }

  getControlKeys(category: string): string[] {
    const grp = this.form?.get(category) as FormGroup;
    return grp ? Object.keys(grp.controls) : [];
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

  onSubmit() {
    if (!this.form || !this.form.valid) {
      console.error('Form is invalid or not available');
      return;
    }

    // Cache current state before submission
    this.cacheCurrentCategoryState();

    const formData = this.form.getRawValue();
    this.payLoad = JSON.stringify(formData);
    console.log('Form submitted:', this.payLoad);

    // Clear cache after successful submission
    this.formStateCache.clear();

    this.formSubmit.emit(formData);
  }

  getQuestionsByCategory(category: string) {
    return (
      this.questions?.filter((question) => (question as any).category === category) || []
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
      this.cacheCurrentCategoryState();
      this.currentCategoryIndex++;
      this.restoreCategoryState(this.getCurrentCategory());
      this.cdr.detectChanges();
    }
  }

  previousCategory(): void {
    if (this.currentCategoryIndex > 0) {
      this.cacheCurrentCategoryState();
      this.currentCategoryIndex--;
      this.restoreCategoryState(this.getCurrentCategory());
      this.cdr.detectChanges();
    }
  }

  selectCategory(index: number): void {
    if (index >= 0 && index < this.formCategories().length) {
      // Cache current category state before switching
      this.cacheCurrentCategoryState();

      this.currentCategoryIndex = index;

      // Restore cached state for new category
      this.restoreCategoryState(this.getCurrentCategory());

      // Force change detection
      this.cdr.detectChanges();
    }
  }

  private cacheCurrentCategoryState(): void {
    const currentCategory = this.getCurrentCategory();
    if (currentCategory && this.form.get(currentCategory)) {
      const categoryGroup = this.form.get(currentCategory) as FormGroup;
      const categoryState = categoryGroup.getRawValue();

      console.log(`Caching state for category ${currentCategory}:`, categoryState);
      this.formStateCache.set(currentCategory, categoryState);
    }
  }

  private restoreCategoryState(categoryKey: string): void {
    if (!categoryKey || !this.form.get(categoryKey)) return;

    const cachedState = this.formStateCache.get(categoryKey);
    if (cachedState) {
      console.log(`Restoring state for category ${categoryKey}:`, cachedState);
      const categoryGroup = this.form.get(categoryKey) as FormGroup;

      // Only patch values that exist in the current form structure
      Object.keys(cachedState).forEach(controlKey => {
        const control = categoryGroup.get(controlKey);
        if (control) {
          control.setValue(cachedState[controlKey], { emitEvent: false });
        }
      });
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
