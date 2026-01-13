import { Injectable, signal, WritableSignal, computed, Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FormStateService {
    private formGroup = signal<FormGroup | null>(null);

    // Derived signals
    isValid: Signal<boolean> = computed(() => {
        const form = this.formGroup();
        // We can't easily react to reactive form status changes with just a computed on the group instance
        // We need to subscribe to statusChanges.
        // So this approach of just computed from the signal might not be enough if we want real-time updates
        // unless we also signal-wrap the status.
        return false; // See initialization
    });

    // Actually, better pattern:
    // When we register the form, we create signals from its observables.

    private _isValid = signal<boolean>(true);
    private _isDirty = signal<boolean>(false);
    private _value = signal<any>(null);

    readonly isValidSignal = this._isValid.asReadonly();
    readonly isDirtySignal = this._isDirty.asReadonly();
    readonly valueSignal = this._value.asReadonly();

    private _ajaxConfigs = signal<any>({});
    readonly ajaxConfigs = this._ajaxConfigs.asReadonly();

    registerForm(form: FormGroup, ajaxConfigs: any = {}) {
        this.formGroup.set(form);
        this._ajaxConfigs.set(ajaxConfigs);

        // Initial state
        this._isValid.set(form.valid);
        this._isDirty.set(form.dirty);
        this._value.set(form.value);

        // Subscribe to changes
        form.statusChanges.subscribe(status => {
            this._isValid.set(status === 'VALID');
        });

        form.valueChanges.subscribe(value => {
            this._isDirty.set(form.dirty);
            this._value.set(value);
        });
    }

    getForm(): FormGroup | null {
        return this.formGroup();
    }
}
