import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { FormConfig, FormCategory, FieldConfig } from '../../models/form-config.model';
import { FormBuilderService } from '../../services/form-builder.service';
import { FormStateService } from '../../services/form-state.service';
import { FormCachingService } from '../../services/form-caching.service';
import { TextInputComponent } from '../fields/text-input.component';
import { EmailInputComponent } from '../fields/email-input.component';
import { AsyncSelectComponent } from '../fields/async-select.component';

@Component({
    selector: 'app-dynamic-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TextInputComponent,
        EmailInputComponent,
        AsyncSelectComponent
    ],
    template: `
    <div *ngIf="formGroup" [formGroup]="formGroup" class="p-6 bg-white shadow rounded-lg max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">{{ config.form_title }}</h2>

      <!-- Loop through Structure (Categories) -->
      <div *ngFor="let category of config.structure">
        
        <!-- Standard Category (Group) -->
        <div *ngIf="category.isCategory && !category.expandable" [formGroupName]="category.key" class="mb-8 border-b pb-6">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">{{ category.title }}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <ng-container *ngFor="let field of category.fields">
                <ng-container *ngTemplateOutlet="fieldRenderer; context: { field: field, group: getGroup(category.key) }"></ng-container>
             </ng-container>
          </div>
        </div>

        <!-- Expandable Category (Array) -->
        <div *ngIf="category.isCategory && category.expandable" [formArrayName]="category.key" class="mb-8 border-b pb-6">
            <div class="flex justify-between items-center mb-4">
               <h3 class="text-xl font-semibold text-gray-700">{{ category.title }}</h3>
               <button type="button" (click)="addInstance(category.key, category)" 
                  class="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm">
                  + Add {{ category.title }}
               </button>
            </div>

            <div *ngFor="let instance of getArray(category.key).controls; let i = index" [formGroupName]="i" class="mb-4 p-4 border rounded bg-gray-50 relative">
               <div class="absolute top-2 right-2">
                  <button type="button" (click)="removeInstance(category.key, i, category)" class="text-red-500 hover:text-red-700 text-sm">Remove</button>
               </div>
               
               <h4 class="font-medium text-gray-600 mb-2">#{{ i + 1 }}</h4>
               
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <ng-container *ngFor="let field of category.fields">
                    <!-- We need to pass the specific instance group (which is instance/control at index i) -->
                    <!-- And we need to make sure the field key matches the control name in that group. -->
                    <!-- In FormBuilderService, we used field.key.replace('{index}', i). -->
                    <!-- BUT 'formGroupName="i"' sets the context to the array element. -->
                    <!-- Inside this group, the controls are keyed by their names. -->
                    <!-- Does the instance group have keys like "Brandshutzhelfer_Name_0"? -->
                    <!-- Yes, created by FormBuilderService: group[effectiveKey] = ... -->
                    
                    <ng-container *ngTemplateOutlet="fieldRenderer; context: { field: field, group: getInstanceGroup(category.key, i), index: i }"></ng-container>
                 </ng-container>
               </div>
            </div>
        </div>
        
      </div>

      <!-- Footer / Status -->
      <div class="mt-6 flex items-center justify-between border-t pt-6">
         <div class="text-sm text-gray-500">
            <div>Form Valid: <span [class.text-green-600]="stateService.isValidSignal()" [class.text-red-600]="!stateService.isValidSignal()" class="font-bold">{{ stateService.isValidSignal() ? 'Yes' : 'No' }}</span></div>
            <div class="text-xs mt-1">Saved to local storage automatically.</div>
         </div>
         
         <button 
            type="button" 
            (click)="onSubmit()" 
            [disabled]="!stateService.isValidSignal()"
            class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Next / Submit
         </button>
      </div>

    </div>

    <!-- Field Renderer Template -->
    <ng-template #fieldRenderer let-field="field" let-group="group" let-index="index">
       <!-- We need to dynamically resolve the key because of the {index} replacement -->
       <!-- If index is defined, we replace it. -->
       
       <ng-container [ngSwitch]="field.field_type">
          <app-text-input *ngSwitchCase="'text'" [config]="resolveConfig(field, index)" [group]="group"></app-text-input>
          <app-text-input *ngSwitchCase="'number'" [config]="resolveConfig(field, index)" [group]="group"></app-text-input> <!-- Reusing text input for now, it handles type='number' -->
          <app-email-input *ngSwitchCase="'email'" [config]="resolveConfig(field, index)" [group]="group"></app-email-input>
          <app-async-select *ngSwitchCase="'ajax_select'" [config]="resolveConfig(field, index)" [group]="group"></app-async-select>
          
          <!-- Fallback -->
          <div *ngSwitchDefault class="text-red-500">
             Unknown field type: {{ field.field_type }}
          </div>
       </ng-container>
    </ng-template>
  `
})
export class DynamicFormComponent implements OnInit {
    @Input({ required: true }) config!: FormConfig;
    @Output() formSubmit = new EventEmitter<any>();

    formGroup!: FormGroup;

    // Inject services
    private formBuilder = inject(FormBuilderService);
    stateService = inject(FormStateService); // Public for template
    private cachingService = inject(FormCachingService);

    ngOnInit() {
        if (this.config) {
            this.initForm();
        }
    }

    private initForm() {
        this.formGroup = this.formBuilder.buildForm(this.config);

        // Register with state service
        this.stateService.registerForm(this.formGroup, this.config.shared_configs?.ajax_configs);

        // Init Caching
        this.cachingService.initCaching(this.formGroup, this.config.form_id);
    }

    onSubmit() {
        if (this.formGroup.valid) {
            this.formSubmit.emit(this.formGroup.value);
        } else {
            this.formGroup.markAllAsTouched();
        }
    }

    getGroup(key: string): FormGroup {
        return this.formGroup.get(key) as FormGroup;
    }

    getArray(key: string): FormArray {
        return this.formGroup.get(key) as FormArray;
    }

    getInstanceGroup(key: string, index: number): FormGroup {
        const array = this.getArray(key);
        return array.at(index) as FormGroup;
    }

    addInstance(key: string, category: FormCategory) {
        this.formBuilder.addCategoryInstance(this.getArray(key), category);
    }

    removeInstance(key: string, index: number, category: FormCategory) {
        this.formBuilder.removeCategoryInstance(this.getArray(key), index, category);
    }

    resolveConfig(field: FieldConfig, index?: number): FieldConfig {
        if (index === undefined || index === null) return field;

        // Clone and replace key
        return {
            ...field,
            key: field.key.replace('{index}', index.toString())
        };
    }
}
