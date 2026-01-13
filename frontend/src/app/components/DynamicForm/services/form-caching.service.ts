import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { debounceTime, filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FormCachingService {
    private readonly CACHE_KEY_PREFIX = 'dynamic_form_cache_';

    initCaching(form: FormGroup, formId: string) {
        const key = `${this.CACHE_KEY_PREFIX}${formId}`;

        // Load initial state
        const cachedValue = localStorage.getItem(key);
        if (cachedValue) {
            try {
                const parsed = JSON.parse(cachedValue);
                form.patchValue(parsed, { emitEvent: false });
                form.markAsDirty(); // Optional: mark as dirty so user knows it's a draft
            } catch (e) {
                console.error('Failed to parse cached form value', e);
            }
        }

        // Save on change with debounce
        form.valueChanges.pipe(
            debounceTime(500), // 500ms debounce
            filter(() => form.valid !== undefined) // Basic check
        ).subscribe(value => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    }

    clearCache(formId: string) {
        const key = `${this.CACHE_KEY_PREFIX}${formId}`;
        localStorage.removeItem(key);
    }
}
