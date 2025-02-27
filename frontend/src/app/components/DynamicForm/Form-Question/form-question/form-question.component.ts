// form-question.component.ts
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionBase } from '../../question-base';
import { ApiService } from '../../../../global-services/ajax-service/ajax.service';
import { Subject, takeUntil } from 'rxjs';

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
  
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (this.question.fetchOptions && this.question.apiEndpoint) {
      this.loadOptions();
    }
  }

  private loadOptions() {
    this.loading = true;
    this.error = null;
    
    this.apiService.get<any[]>(this.question.apiEndpoint!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          this.question.options = options.map(opt => ({
            key: opt.value,
            value: opt.label
          }));
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load options';
          this.loading = false;
        }
      });
  }

  get isValid() {
    return this.form.controls[this.question.key].valid;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}