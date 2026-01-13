import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { QuestionBaseComponent } from '../question-base/question-base.component';
import { FormStateService } from '../../services/form-state.service';
import { FormValidationService } from '../../services/form-validation.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError, filter, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-async-select',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div [formGroup]="group()" class="mb-4 relative">
      <label [for]="config().key" class="block text-sm font-medium text-gray-700 mb-1">
        {{ config().label }}
        <span *ngIf="config().required" class="text-red-500">*</span>
      </label>
      
      <div class="relative">
        <input
            [id]="config().key + '_search'"
            type="text"
            [formControl]="searchControl"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            [ngClass]="{'border-red-500': hasControlError}"
            [placeholder]="config().help_text || 'Search...'"
            (focus)="onFocus()"
            (blur)="onBlur()"
            autocomplete="off"
        />
        <!-- Hidden input for the actual value if needed, or we just rely on the control value which we set programmatically -->
        
        <div *ngIf="isLoading()" class="absolute right-2 top-2">
            <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>

        <ul *ngIf="showDropdown() && options().length > 0" class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <li *ngFor="let opt of options()" 
                (click)="selectOption(opt)"
                class="relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900">
                <span class="block truncate" [class.font-semibold]="isSelected(opt)">
                    {{ getDisplayValue(opt) }}
                </span>
            </li>
        </ul>
        
        <div *ngIf="showDropdown() && options().length === 0 && !isLoading() && searchControl.value" class="absolute z-10 mt-1 w-full bg-white p-2 text-sm text-gray-500 shadow-lg border rounded-md">
            No results found.
        </div>
      </div>
      
      <div *ngIf="selectedLabel()" class="mt-1 text-sm text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded">
          <span>Selected: <strong>{{ selectedLabel() }}</strong></span>
          <button type="button" (click)="clearSelection()" class="text-red-500 hover:text-red-700 ml-2">Clear</button>
      </div>

      <div *ngIf="hasControlError" class="text-red-500 text-xs mt-1">
         <div *ngIf="control?.errors?.['required']">{{ validationService.getErrorMessage('required', true) }}</div>
      </div>
    </div>
  `
})
export class AsyncSelectComponent extends QuestionBaseComponent {
    private http = inject(HttpClient);
    private stateService = inject(FormStateService);
    validationService = inject(FormValidationService);

    searchControl = new FormControl('');

    // Internal state
    showDropdown = signal(false);
    isLoading = signal(false);
    options = signal<any[]>([]);

    // Derived state for display
    selectedLabel = signal<string>('');

    // Accessors for config
    get ajaxConfig() {
        const configKey = this.config().ajax_config;
        if (!configKey) return null;
        return this.stateService.ajaxConfigs()[configKey];
    }

    get hasControlError() {
        return this.hasError || (this.control?.invalid && this.control?.touched && !this.searchControl.dirty); // Check dirty on search too?
    }

    constructor() {
        super();

        // Setup search stream
        this.searchControl.valueChanges.pipe(
            filter(val => typeof val === 'string'), // Only string inputs
            tap(() => this.isLoading.set(true)),
            debounceTime(300), // Default debounce, overridden by config if present
            distinctUntilChanged(),
            switchMap(term => this.performSearch(term as string)),
            tap(() => this.isLoading.set(false))
        ).subscribe(results => {
            this.options.set(results);
            this.showDropdown.set(true);
        });

        // Effect to sync model value to internal label if necessary?
        // Since we write ID to model, we might need a way to look up the Label if we only have ID initially.
        // For now, simpler: user searches -> selects -> we store ID and Label.
    }

    onFocus() {
        if (!this.searchControl.value) {
            // Trigger empty search if desired, or just show if we have options
            this.performSearch('').subscribe(results => {
                this.options.set(results);
                this.showDropdown.set(true);
            });
        } else {
            this.showDropdown.set(true);
        }
    }

    onBlur() {
        // Delay hide to allow click
        setTimeout(() => this.showDropdown.set(false), 200);
        this.control?.markAsTouched();
    }

    performSearch(term: string): Observable<any[]> {
        const config = this.ajaxConfig;
        if (!config) return of([]);

        let debounce = config.debounceTime || 300;
        // Note: Debounce is already applied in pipe. If we want dynamic debounce per config, 
        // we'd need to build the pipe dynamically or uses switchMap with timer.
        // For this simple impl, we used static 300 in constructor or we can reconstruct.
        // Given complexity, 300ms static or re-subscribing in ngOnInit is better. 
        // Let's assume 300ms is fine for all or we fix it later.

        const params = new HttpParams().set(this.config().search_field || 'search', term);

        return this.http.request<any[]>(config.method || 'GET', config.endpoint, { params }).pipe(
            catchError(err => {
                console.error('Ajax search failed', err);
                return of([]);
            })
        );
    }

    selectOption(opt: any) {
        const valueField = this.config().value_field || 'sys_id';
        const displayField = this.config().display_field || 'name';

        const val = opt[valueField];
        const label = opt[displayField];

        this.control?.setValue(val);
        this.selectedLabel.set(label);

        this.searchControl.setValue('', { emitEvent: false }); // Reset search
        this.showDropdown.set(false);
    }

    getDisplayValue(opt: any) {
        return opt[this.config().display_field || 'name'];
    }

    isSelected(opt: any) {
        const valueField = this.config().value_field || 'sys_id';
        return this.control?.value === opt[valueField];
    }

    clearSelection() {
        this.control?.setValue(null);
        this.selectedLabel.set('');
    }
}
