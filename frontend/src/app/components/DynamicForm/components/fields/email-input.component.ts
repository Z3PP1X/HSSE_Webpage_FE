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
      <label [for]="config().key" class="block text-sm font-bold text-zinc-400 mb-2">
        {{ config().label }}
        <span *ngIf="config().required" class="text-sixt-orange">*</span>
      </label>
      
      <input
        [id]="config().key"
        type="email"
        [formControlName]="config().key"
        class="block w-full rounded-xl bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-600 shadow-inner focus:border-sixt-orange focus:ring-1 focus:ring-sixt-orange sm:text-sm p-3 transition-all hover:border-zinc-600"
        [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': hasError}"
        [placeholder]="config().help_text || ''"
      />
      
      <div *ngIf="hasError" class="text-red-400 text-xs mt-2 flex items-center gap-1 animate-fadeIn">
        <span class="material-icons text-[14px]">error_outline</span>
        <div *ngIf="control?.errors?.['required']">{{ validationService.getErrorMessage('required', true) }}</div>
        <div *ngIf="control?.errors?.['email']">{{ validationService.getErrorMessage('email', true) }}</div>
      </div>
    </div>
  `
})
export class EmailInputComponent extends QuestionBaseComponent {
  validationService = inject(FormValidationService);
}
