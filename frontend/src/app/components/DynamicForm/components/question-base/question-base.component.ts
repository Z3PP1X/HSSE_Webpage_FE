import { Directive, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../../models/form-config.model';
import { CommonModule } from '@angular/common';

@Directive()
export abstract class QuestionBaseComponent {
    config = input.required<FieldConfig>();
    group = input.required<FormGroup>();

    // Helper to access the control easily in template
    get control() {
        return this.group().get(this.config().key);
    }

    get isValid() {
        return this.control?.valid;
    }

    get isTouched() {
        return this.control?.touched;
    }

    get hasError() {
        return this.control?.invalid && (this.control?.dirty || this.control?.touched);
    }
}
