import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionBase } from '../../question-base';

import { Subject, Observable, startWith, map } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ApiService } from '../../../../global-services/api-service/api-service'; // Use the main ApiService

@Component({
  selector: 'app-form-question',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule, 
    MatCheckboxModule
  ],
  templateUrl: './form-question.component.html',
  styleUrls: ['./form-question.component.css']
})
export class FormQuestionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() question!: QuestionBase<string>;
  @Input() form!: FormGroup;
  @Input() currentCategory!: string;

  loading = false;
  error: string | null = null;
  filteredOptions: Observable<{key: string, value: string | number}[]> | undefined;

  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) {
    console.log('FormQuestionComponent constructor - ApiService injected:', !!this.apiService);
  }

  ngOnInit() {
    console.log('FormQuestionComponent ngOnInit - Question:', this.question);
    console.log('Question field_type:', this.question?.field_type);
    console.log('Question details:', {
      key: this.question?.key,
      field_type: this.question?.field_type,
      endpoint: (this.question as any)?.endpoint,
      ajax_config: (this.question as any)?.ajax_config
    });
    
    // Setup autocomplete if needed
    if (this.question.field_type === 'autocomplete') {
      this.setupAutocomplete();
    }
    
    // Load ajax options if it's an ajax_select field
    if (this.question.field_type === 'ajax_select') {
      console.log('🔥 DETECTED ajax_select field!');
      this.loadAjaxOptions();
    } else {
      console.log('❌ Not an ajax_select field, type is:', this.question.field_type);
    }
  }

  private setupAutocomplete() {
    this.question.options = [
      { key: 'option1', value: 1 },
      { key: 'option2', value: 2 },
      { key: 'option3', value: 3 }
    ];
    
    const control = this.getCurrentControl();
    if (control) {
      this.filteredOptions = control.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || ''))
      );
    }
  }
  
  private _filter(value: string): {key: string, value: string | number}[] {
    const filterValue = value.toLowerCase();
    return this.question.options.filter(option => 
      option.value.toString().toLowerCase().includes(filterValue));
  }

  private loadOptions() {
    this.loading = true;
    this.error = null;

    this.apiService.get<any[]>("test")
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

  private handleResponse(response: any) {
    switch (this.question.field_type) {
      case 'dropdown':
      case 'autocomplete':
        this.question.options = response.map((item: any) => ({
          key: item.value,
          value: item.label
        }));
        break;
      default:
        console.warn(`Unhandled controlType: ${this.question.field_type}`);
        break;
    }
  }

  private loadAjaxOptions() {
    console.log('🚀 loadAjaxOptions called');
    const ajaxQuestion = this.question as any;
    
    console.log('Ajax question full object:', ajaxQuestion);
    console.log('Ajax question config check:', {
      endpoint: ajaxQuestion.endpoint,
      ajax_config: ajaxQuestion.ajax_config,
      search_field: ajaxQuestion.search_field,
      display_field: ajaxQuestion.display_field,
      value_field: ajaxQuestion.value_field,
      hasEndpoint: !!ajaxQuestion.endpoint
    });
    
    if (ajaxQuestion.endpoint) {
      console.log('✅ Endpoint found, making API call to:', ajaxQuestion.endpoint);
      this.loading = true;
      this.error = null;
      
      console.log('ApiService available:', !!this.apiService);
      console.log('About to call apiService.get()');

      this.apiService.get<any[]>(ajaxQuestion.endpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('🎉 Ajax response received:', response);
            this.handleAjaxResponse(response, ajaxQuestion);
            this.loading = false;
          },
          error: (err) => {
            console.error('💥 Ajax select error:', err);
            this.error = 'Failed to load options';
            this.loading = false;
          }
        });
    } else {
      console.warn('❌ No endpoint found for ajax_select field:', ajaxQuestion.key);
      console.log('Available properties on question:', Object.keys(ajaxQuestion));
    }
  }

  private handleAjaxResponse(response: any[], ajaxQuestion: any) {
    console.log('handleAjaxResponse called with:', response, ajaxQuestion);
    
    if (Array.isArray(response)) {
        this.question.options = response.map((item: any) => {
            const option = {
                key: item[ajaxQuestion.value_field || 'sys_id'] || item.id || item.value,
                value: item[ajaxQuestion.value_field || 'sys_id'] || item.id || item.value,
                label: item[ajaxQuestion.display_field || 'BranchName'] || item.name || item.label || item.value
            };
            console.log('Mapped option:', option, 'from item:', item);
            return option;
        });
        
        console.log('Final options array:', this.question.options);
    } else {
        console.warn('Ajax response is not an array:', response);
    }
  }

  onAjaxSelectChange(event: any) {
    // Handle selection change if needed
    console.log('Ajax select changed:', event.value);
  }

  getControlName(): string {
    // control names are already concrete (Ersthelfer_Name_1)
    return this.question.key.includes('.') ? this.question.key.split('.').pop()! : this.question.key;
  }

  getCurrentFormGroup(): FormGroup {
    if (this.currentCategory) {
      const g = this.form.get(this.currentCategory);
      if (g instanceof FormGroup) return g;
    }
    return this.form;
  }

  // Helper method to get the current control
  getCurrentControl(): FormControl | null {
    const formGroup = this.getCurrentFormGroup();
    const controlName = this.getControlName();
    return formGroup.get(controlName) as FormControl;
  }

  get isValid() {
    const control = this.getCurrentControl();
    return control ? control.valid : true;
  }

  getOptionLabel(option: any): string {
    // Handle different option structures
    if (option.label !== undefined) {
      return option.label;
    }
    if (option.value !== undefined) {
      return option.value.toString();
    }
    if (option.key !== undefined) {
      return option.key.toString();
    }
    return 'Unknown';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges() {
    // Handle changes if needed
  }
}