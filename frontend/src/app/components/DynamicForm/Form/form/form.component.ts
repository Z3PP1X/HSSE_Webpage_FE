import { Component, Input, OnInit, OnDestroy, input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { QuestionBase } from '../../question-base';
import { FormQuestionComponent } from '../../Form-Question/form-question/form-question.component';
import { ApiService } from '../../../../global-services/ajax-service/ajax.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

// Material-Imports
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
    MatInputModule
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnDestroy {
  payLoad: string = ''; 
  private destroy$ = new Subject<void>();
  
  formTitle = input.required<string>();
  @Input() form!: FormGroup;
  @Input() questions: QuestionBase<string>[] = []; // Initialize with empty array
  @Input() metadata: any = null;
  @Output() formSubmit = new EventEmitter<any>();
  
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (this.form) {
      console.log("Form structure:", this.form);
      console.log("Form categories:", this.formCategories());
      console.log("Questions:", this.questions);
      
      this.setupAjaxHandlers();
    }
  }

  // Debug-Hilfsfunktion
  getQuestionDebugInfo(category: string, controlName: string): string {
    const fullKey = `${category}.${controlName}`;
    const matchingQuestion = this.getQuestionForKey(fullKey);
    
    return `Form control: ${fullKey}, Question found: ${matchingQuestion ? 'Yes' : 'No'}`;
  }
  
  formCategories(): string[] {
    if (!this.form) return [];
    return Object.keys(this.form.controls)
      .filter(key => this.form.get(key) instanceof FormGroup);
  }
  
  getQuestionForKey(fullKey: string): QuestionBase<string> | undefined {
    if (!this.questions) return undefined;
    
    return this.questions.find(q => 
      q.key === fullKey || 
      (q.category && q.key && `${q.category}.${q.key}` === fullKey)
    );
  }

  getControlKeys(category: string): string[] {
    const controls = (this.form?.get(category) as FormGroup)?.controls;
    return controls ? Object.keys(controls) : [];
  }

  private setupAjaxHandlers() {
    if (!this.form || !this.questions?.length) return;
    
    this.questions.forEach(question => {
      const control = this.form.get(question.key);
      const config = question.ajaxConfig;
      
      if (control && config) {
        if (config.triggerEvents?.includes('init')) {
          this.handleAjaxCall(question, control.value);
        }
        
        if (config.triggerEvents?.includes('change')) {
          control.valueChanges.pipe(
            debounceTime(config.debounceTime || 300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
          ).subscribe(value => {
            this.handleAjaxCall(question, value);
          });
        }
      }
    });
  }

  private handleAjaxCall(question: QuestionBase<string>, value: any) {
    const config = question.ajaxConfig;
    if (!config?.endpoint) return;

    const params = this.buildParams(config.paramMap || {}, value);
    
    const request$ = config.method === 'POST'
      ? this.apiService.post(config.endpoint, params)
      : this.apiService.get(config.endpoint, { params });

    request$.subscribe({
      next: (response) => {
        config.onSuccess?.({
          response,
          form: this.form,
          question,
          value
        });
      },
      error: (err) => {
        config.onError?.(err);
        console.error(`AJAX failed for ${question.key}:`, err);
      }
    });
  }

  private buildParams(paramMap: Record<string, string>, value: any): HttpParams {
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
    return this.questions?.filter(question => question.category === category) || [];
  }

  isCategoryComplete(category: string): boolean {
    if (!this.form) return false;
    
    const questionsInCategory = this.getQuestionsByCategory(category);
    if (questionsInCategory.length === 0) {
      return false;
    }
    
    return questionsInCategory.every(question => {
      const control = this.form.get(question.key);
      return control && control.valid && control.value;
    });
  }
}