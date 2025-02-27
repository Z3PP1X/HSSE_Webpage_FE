import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
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
  styleUrls: ['./form-question.component.css'] // Corrected to styleUrls
})
export class FormQuestionComponent implements OnInit, OnDestroy {
  @Input() question!: QuestionBase<string>;
  @Input() form!: FormGroup;

  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (this.question.fetchOptions && this.question.apiEndpoint) {
      this.loadOptions();
    }

    if (this.question.controlType === 'textbox' && this.question.ajaxConfig) {
      const control = this.form.get(this.question.key);
      if (control) {
        control.valueChanges
          .pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
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

    const params = { query: value };

    this.apiService.get<any[]>(this.question.ajaxConfig.endpoint, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
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
    if (this.question.ajaxConfig?.targetKey) {
      const control = this.form.get(this.question.ajaxConfig.targetKey);
      return control ? (control as any)._question : null;
    }
    return null;
  }

  private handleResponse(response: any) {
    switch (this.question.controlType) {
      case 'dropdown':
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