import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionBase } from '../../question-base';
import { ApiService } from '../../../../global-services/ajax-service/ajax.service';
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
export class FormQuestionComponent implements OnInit, OnDestroy {
  @Input() question!: QuestionBase<string>;
  @Input() form!: FormGroup;

  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  

  filteredOptions: Observable<{key: string, value: string | number}[]> | undefined;
  
  constructor(private apiService: ApiService) {}

  ngOnInit() {
   
  }
  
  private setupAutocomplete() {
    
    this.question.options = [
      { key: 'option1', value: 1 },
      { key: 'option2', value: 2 },
      { key: 'option3', value: 3 }
    ];
    
    const control = this.form.get(this.question.key) as FormControl;
    
    this.filteredOptions = control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
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

  private handleInputChange(value: string) {
    
    
  }

  private getTargetQuestion(): QuestionBase<string> | null {
    
    
    return null;
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

  getControlName(): string {
    
    const parts = this.question.key.split('.');
    return parts[parts.length - 1];
  }

  // Add this method to form-question.component.ts
getFormGroup(): FormGroup {
  const parts = this.question.key.split('.');
  if (parts.length > 1) {
    const categoryName = parts[0];
    const categoryGroup = this.form.get(categoryName) as FormGroup;
    return categoryGroup || this.form;
  }
  return this.form;
}

  get isValid() {
    const parts = this.question.key.split('.');
    const controlName = parts[parts.length - 1];
    const categoryName = parts.length > 1 ? parts[0] : null;
    
    let control;
    if (categoryName && this.form.get(categoryName)) {
      control = (this.form.get(categoryName) as FormGroup).get(controlName);
    } else {
      control = this.form.get(controlName);
    }
    
    return control ? control.valid : true;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}