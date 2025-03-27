import { Component, Input, OnInit, OnDestroy, input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionBase } from '../../question-base';
import { FormQuestionComponent } from '../../Form-Question/form-question/form-question.component';
import { ApiService } from '../../../../global-services/ajax-service/ajax.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-form',
  standalone: true,
  providers: [FormQuestionComponent, CommonModule],
  imports: [ReactiveFormsModule, FormQuestionComponent],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  formTitle = input.required<string>();
  @Input() questions: QuestionBase<string>[] | null = [];
  @Input() form!: FormGroup;
  @Input() isLoading = false;
  @Output() formSubmitted = new EventEmitter<any>();
  
  payLoad = '';
  selectedCategory: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (this.form) {
      this.setupAjaxHandlers();
    }
    
    if (this.formCategories().length > 0) {
      this.selectedCategory = this.formCategories()[0];
    }
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  formCategories(): string[] {
    if (!this.form) return [];
    return Object.keys(this.form.controls)
      .filter(key => this.form.get(key) instanceof FormGroup);
  }

  getQuestionsByCategory(category: string) {
    return this.questions?.filter(question => question.category === category) || [];
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategory === category;
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
  
  onSubmit() {
    if (!this.form || !this.form.valid) {
      console.error('Form is invalid or not available');
      return;
    }
    
    const formData = this.form.getRawValue();
    this.payLoad = JSON.stringify(formData);
    console.log('Form submitted:', this.payLoad);
    this.formSubmitted.emit(formData);
  }

  private setupAjaxHandlers() {
    if (!this.form || !this.questions) return;
    
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
}