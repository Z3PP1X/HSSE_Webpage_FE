import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionBase } from '../../question-base';

import { Subject, Observable, startWith, map, of, switchMap, catchError } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ApiService } from '../../../../global-services/api-service/api-service'; // Use the main ApiService

import { LoggingService } from '../../../../global-services/logging/logging.service';



@Component({
  selector: 'app-form-question',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
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
  filteredOptions: Observable<{ key: string, value: string | number, label: string }[]> | undefined;
  private log: ReturnType<LoggingService['scoped']>;

  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService,
    private logger: LoggingService
  ) {
    this.log = this.logger.scoped('FormQuestionComponent');
  }

  ngOnInit() {

    // Setup autocomplete if needed
    if (this.question.field_type === 'autocomplete') {
      this.setupAutocomplete();
    }

    // Setup ajax autocomplete - CHANGED THIS LINE
    if (this.question.field_type === 'ajax_select') {

      this.setupAjaxAutocomplete(); // ← Use the new method, not loadAjaxOptions()
    } else {
      this.log.error('❌ Not an ajax_select field, type is:', this.question.field_type);
    }
  }

  private setupAutocomplete() {
    this.question.options = [
      { label: 'option1', value: 1 },
      { label: 'option2', value: 2 },
      { label: 'option3', value: 3 }
    ];

    const control = this.getCurrentControl();
    if (control) {
      this.filteredOptions = control.valueChanges.pipe(
        startWith(''),
        map((value: string | null) => this._filter(value || ''))
      );
    }
  }

  private _filter(value: string): { key: string, value: string | number, label: string }[] {
    const filterValue = value.toLowerCase();
    return this.question.options.filter(option =>
      option.value.toString().toLowerCase().includes(filterValue)
    ).map(option => ({
      key: option.label,
      value: option.value,
      label: option.value.toString() // Add label property
    }));
  }

  private loadOptions() {
    this.loading = true;
    this.error = null;

    this.apiService.get<any[]>("test")
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.handleResponse(response);
          this.loading = false;
        },
        error: (err: any) => {
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
        this.log.warn(`Unhandled controlType: ${this.question.field_type}`);
        break;
    }
  }

  private loadAjaxOptions() {

    const ajaxQuestion = this.question as any;



    if (ajaxQuestion.endpoint) {
      this.log.info('✅ Endpoint found, making API call to:', ajaxQuestion.endpoint);
      this.loading = true;
      this.error = null;



      this.apiService.get<any[]>(ajaxQuestion.endpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {

            this.handleAjaxResponse(response, ajaxQuestion);
            this.loading = false;
          },
          error: (err: any) => {
            this.log.error('💥 Ajax select error:', err);
            this.error = 'Failed to load options';
            this.loading = false;
          }
        });
    } else {
      this.log.warn('❌ No endpoint found for ajax_select field:', ajaxQuestion.key);
      this.log.debug('Available properties on question:', Object.keys(ajaxQuestion));
    }
  }

  private handleAjaxResponse(response: any[], ajaxQuestion: any) {


    if (Array.isArray(response)) {
      this.question.options = response.map((item: any) => {
        const option = {
          key: item[ajaxQuestion.value_field || 'sys_id'] || item.id || item.value,
          value: item[ajaxQuestion.value_field || 'sys_id'] || item.id || item.value,
          label: item[ajaxQuestion.display_field || 'BranchName'] || item.name || item.label || item.value
        };

        return option;
      });


    } else {
      this.log.warn('Ajax response is not an array:', response);
    }
  }

  private setupAjaxAutocomplete() {
    const control = this.getCurrentControl();
    if (!control) return;

    const ajaxQuestion = this.question as any;


    this.filteredOptions = control.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchTerm: string | null) => this.searchAjaxOptions(searchTerm || '')),
      takeUntil(this.destroy$)
    );
  }

  private searchAjaxOptions(searchTerm: string): Observable<{ key: string, value: string | number, label: string }[]> {
    const ajaxQuestion = this.question as any;



    // Don't search if term is too short
    if (!ajaxQuestion.endpoint || searchTerm.length < 2) {

      return of([]);
    }

    this.loading = true;

    // Build search parameters
    const searchField = ajaxQuestion.search_field || 'search';
    const params = { [searchField]: searchTerm };



    return this.apiService.get<any[]>(ajaxQuestion.endpoint, { params }).pipe(
      map((response: any) => {
        this.loading = false;

        if (!Array.isArray(response)) {
          this.log.warn('Response is not an array:', response);
          return [];
        }

        const mappedOptions = response.map((item: any) => {
          const option = {
            key: item[ajaxQuestion.value_field || 'sys_id'] || item.id || item.value,
            value: item[ajaxQuestion.value_field || 'sys_id'] || item.id || item.value,
            label: item[ajaxQuestion.display_field || 'BranchName'] || item.name || item.label || item.value
          };

          return option;
        });


        return mappedOptions;
      }),
      catchError((err: any) => {
        this.log.error('💥 Ajax search error:', err);
        this.loading = false;
        this.error = 'Search failed';
        return of([]);
      })
    );
  }

  onAjaxSelectChange(event: any) {
    // Handle selection change if needed

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

  getErrorMessages(): string[] {
    const c = this.getCurrentControl();
    if (!c || !c.errors) return [];
    const msgs: string[] = [];
    if (c.errors['required']) msgs.push(`${this.question.label} ist erforderlich`);
    if (c.errors['email']) msgs.push('Bitte gültige E-Mail eingeben');
    if (c.errors['pattern'] && (this.question.field_type === 'number' || this.question.field_type === 'integer'))
      msgs.push('Nur Zahlen erlaubt');
    return msgs;
  }

  get touched(): boolean {
    const control = this.getCurrentControl();
    return control ? control.touched : false;
  }

  get isRequired(): boolean {
    const control = this.getCurrentControl();
    // This is a naive check; Angular doesn't expose 'required' validator existence easily on standard FormControl without checking validator composition.
    // But we can check if it fails 'required' when empty? 
    // Or we check the question definition if it has required property (if exists)
    // For now, let's trust the error, or simply check validator ? 
    // The most reliable way for dynamic forms is usually in the QuestionBase. 
    // Let's assume QuestionBase might have it, or we rely on the control validator.

    if (this.question && (this.question as any).required) return true;

    // Fallback check validator
    if (!control || !control.validator) return false;
    const validator = control.validator({} as any);
    return validator && validator['required'];
  }

  getFirstErrorMessage(): string {
    const errors = this.getErrorMessages();
    return errors.length > 0 ? errors[0] : '';
  }

  toggleCheckbox(controlName: string) {
    const control = this.getCurrentFormGroup().get(controlName);
    if (control) {
      control.setValue(!control.value);
      control.markAsTouched();
    }
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