import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FieldConfig } from '../models/form-config.model';

@Injectable({
    providedIn: 'root'
})
export class FormValidationService {

    getValidators(field: FieldConfig): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        // Skip required validation for ajax_select fields
        if (field.required && field.field_type !== 'ajax_select') {
            validators.push(Validators.required);
        }

        if (field.field_type === 'email') {
            validators.push(Validators.email);
        }

        // Pattern matching for specific fields based on key or label
        if (this.isPhoneNumber(field)) {
            validators.push(this.phoneNumberValidator());
        }

        if (this.isZipCode(field)) {
            validators.push(this.zipCodeValidator());
        }

        return validators;
    }

    private isPhoneNumber(field: FieldConfig): boolean {
        const key = field.key.toLowerCase();
        const label = field.label.toLowerCase();
        return key.includes('phone') || label.includes('telefon') || label.includes('fax');
    }

    private isZipCode(field: FieldConfig): boolean {
        const key = field.key.toLowerCase();
        const label = field.label.toLowerCase();
        return key.includes('zip') || key.includes('plz') || label.includes('postleitzahl');
    }

    private phoneNumberValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null; // Let required validator handle empty values
            }
            // Basic international phone regex or simple digit check
            const valid = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(control.value);
            return valid ? null : { invalidPhone: true };
        };
    }

    private zipCodeValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }
            // German ZIP code (5 digits) - adjust as needed for international
            const valid = /^[0-9]{5}$/.test(control.value);
            return valid ? null : { invalidZip: true };
        };
    }

    getErrorMessage(errorKey: string, errorValue: any): string {
        switch (errorKey) {
            case 'required':
                return 'This field is required.';
            case 'email':
                return 'Please enter a valid email address.';
            case 'invalidPhone':
                return 'Please enter a valid phone number.';
            case 'invalidZip':
                return 'Please enter a valid ZIP code (5 digits).';
            default:
                return `Invalid value: ${errorKey}`;
        }
    }
}
