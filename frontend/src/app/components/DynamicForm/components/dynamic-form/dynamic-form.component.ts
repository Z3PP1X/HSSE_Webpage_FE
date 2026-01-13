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
    <div *ngIf="formGroup" [formGroup]="formGroup" class="p-8 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl max-w-4xl mx-auto ring-1 ring-white/5 relative overflow-hidden">
      <!-- Decorator -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-sixt-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <h2 class="text-3xl font-bold mb-8 text-white tracking-tight relative z-10">{{ config.form_title }}</h2>

      <!-- Loop through Structure (Categories) -->
      <div *ngFor="let category of config.structure">
        
        <!-- Standard Category (Group) -->
        <div *ngIf="category.isCategory && !category.expandable" [formGroupName]="category.key" class="mb-10 last:mb-0 last:border-0 border-b border-zinc-800/50 pb-8">
          <h3 class="text-xl font-bold mb-6 text-zinc-100 flex items-center gap-3">
             <span class="w-1.5 h-6 bg-sixt-orange rounded-full"></span>
             {{ category.title }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <ng-container *ngFor="let field of category.fields">
                <ng-container *ngTemplateOutlet="fieldRenderer; context: { field: field, group: getGroup(category.key) }"></ng-container>
             </ng-container>
          </div>
        </div>

        <!-- Expandable Category (Array) -->
        <div *ngIf="category.isCategory && category.expandable" [formArrayName]="category.key" class="mb-10 last:mb-0 last:border-0 border-b border-zinc-800/50 pb-8">
            <div class="flex justify-between items-center mb-6">
               <h3 class="text-xl font-bold text-zinc-100 flex items-center gap-3">
                 <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                 {{ category.title }}
               </h3>
               <button type="button" (click)="addInstance(category.key, category)" 
                  class="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 group">
                  <span class="group-hover:text-green-500 transition-colors font-bold text-lg leading-none">+</span> 
                  Add {{ category.title }}
               </button>
            </div>

            <div *ngFor="let instance of getArray(category.key).controls; let i = index" [formGroupName]="i" class="mb-4 p-6 border border-zinc-800 rounded-xl bg-zinc-950/50 relative group hover:border-zinc-700 transition-colors">
               <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" (click)="removeInstance(category.key, i, category)" 
                     class="text-zinc-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                     <span class="material-icons text-sm">close</span>
                  </button>
               </div>
               
               <h4 class="font-medium text-zinc-500 mb-4 text-xs uppercase tracking-wider">Entry #{{ i + 1 }}</h4>
               
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ng-container *ngFor="let field of category.fields">  
                    <ng-container *ngTemplateOutlet="fieldRenderer; context: { field: field, group: getInstanceGroup(category.key, i), index: i }"></ng-container>
                 </ng-container>
               </div>
            </div>
        </div>
        
      </div>

      <!-- Footer / Status -->
      <div class="mt-8 flex items-center justify-between border-t border-zinc-800 pt-8 relative z-10">
         <div class="text-sm text-zinc-500">
            <div class="flex items-center gap-2">
                Status: 
                <span [class.text-green-500]="stateService.isValidSignal()" [class.text-red-500]="!stateService.isValidSignal()" class="font-bold flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full" [class.bg-green-500]="stateService.isValidSignal()" [class.bg-red-500]="!stateService.isValidSignal()"></span>
                    {{ stateService.isValidSignal() ? 'Ready to Review' : 'Incomplete' }}
                </span>
            </div>
            <div class="text-xs mt-1 opacity-70">Auto-saved to local storage.</div>
         </div>
         
         <button 
            type="button" 
            (click)="onSubmit()" 
            [disabled]="!stateService.isValidSignal()"
            class="px-8 py-3 bg-gradient-to-r from-sixt-orange to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none transition-all flex items-center gap-2">
            Next Step
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
         </button>
      </div>

    </div>

    <!-- Field Renderer Template -->
    <ng-template #fieldRenderer let-field="field" let-group="group" let-index="index">
       <ng-container [ngSwitch]="field.field_type">
          <app-text-input *ngSwitchCase="'text'" [config]="resolveConfig(field, index)" [group]="group"></app-text-input>
          <app-text-input *ngSwitchCase="'number'" [config]="resolveConfig(field, index)" [group]="group"></app-text-input>
          <app-email-input *ngSwitchCase="'email'" [config]="resolveConfig(field, index)" [group]="group"></app-email-input>
          <app-async-select *ngSwitchCase="'ajax_select'" [config]="resolveConfig(field, index)" [group]="group"></app-async-select>
          
          <!-- Fallback -->
          <div *ngSwitchDefault class="text-red-400 bg-red-900/10 p-2 rounded border border-red-900/30">
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
