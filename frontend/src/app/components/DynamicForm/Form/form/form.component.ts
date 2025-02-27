import { Component, Input, OnInit, OnDestroy, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionBase } from '../../question-base';
import { QuestionControlService } from '../../services/question-control.service';
import { FormQuestionComponent } from '../../Form-Question/form-question/form-question.component';
import { ApiService } from '../../../../global-services/ajax-service/ajax.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-form',
  standalone: true,
  providers: [QuestionControlService, FormQuestionComponent],
  imports: [ReactiveFormsModule, FormQuestionComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  formTitle = input.required<string>();
  @Input() questions: QuestionBase<string>[] | null = [];
  form!: FormGroup;
  payLoad = '';

  constructor(
    private qcs: QuestionControlService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.form = this.qcs.toFormGroup(this.questions as QuestionBase<string>[]);
    this.setupAjaxHandlers();
  }

  private setupAjaxHandlers() {
    this.questions?.forEach(question => {
      const control = this.form.get(question.key);
      const config = question.ajaxConfig;

      if (control && config) {
        // Handle initial data fetch
        if (config.triggerEvents?.includes('init')) {
          this.handleAjaxCall(question, control.value);
        }

        // Handle value changes
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

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.getRawValue());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}