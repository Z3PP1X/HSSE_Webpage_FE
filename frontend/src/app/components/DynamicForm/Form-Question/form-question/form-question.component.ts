// form-question.component.ts
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionBase } from '../../question-base';
import { ApiService } from '../../../../global-services/ajax-service/ajax.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-form-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-question.component.html',
  styleUrl: './form-question.component.css'
})
export class FormQuestionComponent implements OnInit, OnDestroy {
  @Input() question!: QuestionBase<string>;
  @Input() form!: FormGroup;

  loading = false; // Track loading state
  error: string | null = null; // Track error state
  private destroy$ = new Subject<void>(); // For cleanup

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Fetch initial options if fetchOptions is true
    if (this.question.fetchOptions && this.question.apiEndpoint) {
      this.loadOptions();
    }

    // Listen for input changes if the question is a textbox
    if (this.question.controlType === 'textbox' && this.question.ajaxConfig) {
      const control = this.form.get(this.question.key);
      if (control) {
        control.valueChanges
          .pipe(
            debounceTime(500), // Debounce to avoid too many API calls
            distinctUntilChanged(), // Only emit if the value changes
            takeUntil(this.destroy$) // Clean up on destroy
          )
          .subscribe((value) => {
            if (value) {
              this.handleInputChange(value);
            }
          });
      }
    }
  }

  private loadOptions() {
    this.loading = true;
    this.error = null;

    this.apiService.get<any[]>(this.question.apiEndpoint!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.handleResponse(response);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load data';
          this.loading = false;
        }
      });
  }

  private handleInputChange(value: string) {
    if (!this.question.ajaxConfig?.endpoint) return;

    this.loading = true;
    this.error = null;

    const params = { query: value }; // Pass the input value as a query param

    this.apiService.get<any[]>(this.question.ajaxConfig.endpoint, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Update the select field with the response
          const targetQuestion = this.getTargetQuestion();
          if (targetQuestion) {
            targetQuestion.options = response.map((item: any) => ({
              key: item.value,
              value: item.label
            }));
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load options';
          this.loading = false;
        }
      });
  }

  private getTargetQuestion(): QuestionBase<string> | null {
    // Get the target question from the form controls
    if (this.question.ajaxConfig?.targetKey) {
      const control = this.form.get(this.question.ajaxConfig.targetKey);
      return control ? (control as any)._question : null;
    }
    return null;
  }
  private handleResponse(response: any) {
    switch (this.question.controlType) {
      case 'dropdown':
        // For dropdowns, map the response to options
        this.question.options = response.map((item: any) => ({
          key: item.value,
          value: item.label
        }));
        break;

      default:
        console.warn(`Unhandled controlType: ${this.question.controlType}`);
        break;
    }
  }

  get isValid() {
    return this.form.controls[this.question.key].valid;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}