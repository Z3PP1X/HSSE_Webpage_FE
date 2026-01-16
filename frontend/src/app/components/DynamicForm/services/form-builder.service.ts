import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FormConfig, FormCategory, FieldConfig } from '../models/form-config.model';
import { FormValidationService } from './form-validation.service';

@Injectable({
    providedIn: 'root'
})
export class FormBuilderService {
    private fb = inject(FormBuilder);
    private validationService = inject(FormValidationService);

    buildForm(config: FormConfig): FormGroup {
        const formGroup: any = {};

        config.structure.forEach(category => {
            if (category.isCategory) {
                if (category.expandable) {
                    formGroup[category.key] = this.createExpandableCategory(category);
                } else {
                    formGroup[category.key] = this.createCategoryGroup(category);
                }
            }
        });

        return this.fb.group(formGroup);
    }

    private createCategoryGroup(category: FormCategory): FormGroup {
        const group: any = {};
        if (category.fields) {
            category.fields.forEach(field => {
                // Generate unique key by appending group if present
                // This prevents collisions when backend sends duplicate keys with different groups
                const effectiveKey = field.group
                    ? `${field.key}_${field.group}`
                    : field.key;
                group[effectiveKey] = this.createControl(field);
            });
        }
        return this.fb.group(group);
    }

    private createExpandableCategory(category: FormCategory): FormArray {
        const formArray = this.fb.array([]) as FormArray;
        const minInstances = category.min_instances || 0;

        // Create initial instances
        for (let i = 0; i < minInstances; i++) {
            formArray.push(this.createCategoryInstance(category, i));
        }

        return formArray;
    }

    // Create a single row/instance for an expandable category
    createCategoryInstance(category: FormCategory, index: number): FormGroup {
        const group: any = {};
        if (category.fields) {
            category.fields.forEach(field => {
                // We might need to adjust the key if it has a dynamic part like {index}
                // But for the FormControl in the FormGroup, we usually keep a static key
                // However, the provided JSON shows keys like "Ersthelfer_Name_{index}"
                // In a FormArray, the controls inside the group don't strictly need unique keys 
                // RELATIVE to the array index, but standard practice is simple keys.
                // Given the JSON has specific keys, let's process them to be unique or keep as is?
                // Angular FormArray > FormGroup > FormControl name is local to the group.
                // So we can probably perform a regex replacement for {index} -> actual index
                // to match the backend expectation if needed, OR keep it generic.
                // Let's replace {index} with empty or specific index to be safe for display/binding validation

                const effectiveKey = field.key.replace('{index}', index.toString());
                // We will store it with the 'effectiveKey' in the form group
                group[effectiveKey] = this.createControl(field);
            });
        }
        return this.fb.group(group);
    }

    // Helper to add a new instance dynamically
    addCategoryInstance(formArray: FormArray, category: FormCategory): void {
        const index = formArray.length;
        if (category.max_instances && index >= category.max_instances) {
            return;
        }
        formArray.push(this.createCategoryInstance(category, index));
    }

    removeCategoryInstance(formArray: FormArray, index: number, category: FormCategory): void {
        if (formArray.length > (category.min_instances || 0)) {
            formArray.removeAt(index);
        }
    }

    private createControl(field: FieldConfig): FormControl {
        const validators = this.validationService.getValidators(field);
        return this.fb.control(null, validators);
    }
}
