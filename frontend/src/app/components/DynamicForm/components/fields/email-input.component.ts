import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { QuestionBaseComponent } from '../question-base/question-base.component';
import { FormValidationService } from '../../services/form-validation.service';

@Component({
    selector: 'app-email-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div [formGroup]="group()" class="mb-4">
      <label [for]="config().key" class="block text-sm font-medium text-gray-700 mb-1">
        {{ config().label }}
        <span *ngIf="config().required" class="text-red-500">*</span>
      </label>
      
      <input
        [id]="config().key"
        type="email"
        [formControlName]="config().key"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        [ngClass]="{'border-red-500': hasError}"
        [placeholder]="config().help_text || ''"
      />
      
      <div *ngIf="hasError" class="text-red-500 text-xs mt-1">
        <div *ngIf="control?.errors?.['required']">{{ validationService.getErrorMessage('required', true) }}</div>
        <div *ngIf="control?.errors?.['email']">{{ validationService.getErrorMessage('email', true) }}</div>
      </div>
    </div>
  `
})
export class EmailInputComponent extends QuestionBaseComponent {
    validationService = inject(FormValidationService);
}
