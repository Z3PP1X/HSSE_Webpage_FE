import { Injectable } from '@angular/core';

export interface CachedFormState {
    values: any;
    status: string; // 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'
}

@Injectable({
    providedIn: 'root'
})
export class FormStateService {
    private cache = new Map<string, CachedFormState>();

    /**
     * Save the current state of a form
     */
    saveState(formId: string, values: any, status: string): void {
        console.log(`[FormStateService] Saving state for ${formId}`, { status });
        this.cache.set(formId, { values, status });
    }

    /**
     * Retrieve cached state for a form
     */
    getState(formId: string): CachedFormState | null {
        const state = this.cache.get(formId);
        if (state) {
            console.log(`[FormStateService] Restoring state for ${formId}`, { status: state.status });
            return state;
        }
        return null;
    }

    /**
     * Clear cached state (e.g., on successful submission)
     */
    clearState(formId: string): void {
        this.cache.delete(formId);
    }

    /**
     * Check if state exists
     */
    hasState(formId: string): boolean {
        return this.cache.has(formId);
    }
}
