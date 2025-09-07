import { Injectable } from "@angular/core";
import { FormGroup, FormArray } from "@angular/forms";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";

import { QuestionBase } from "../question-base";
import { FormGroupBase } from "../Form/form/form-group-base";
import { FormModelService } from "./FormModelService";
import { FormBuilderService } from "./FormBuilderService";
// Import the global ApiService instead of HttpClient
import { ApiService } from "../../../global-services/api-service/api-service";

@Injectable({
    providedIn: 'root'
})
export class FormOrchestrationService {
    private currentForm$ = new BehaviorSubject<FormGroup>(new FormGroup({}));
    private loading$ = new BehaviorSubject<boolean>(false);
    private error$ = new BehaviorSubject<string | null>(null);
    private formMetadata$ = new BehaviorSubject<any>(null);
    private formQuestions$ = new BehaviorSubject<FormGroupBase<any>[] | QuestionBase<any>[]>([]);

    constructor(
        // Replace HttpClient with ApiService
        private apiService: ApiService,
        private formModelService: FormModelService,
        
    ) {}

    generateForm(apiEndpoint: string, formName: string = 'dynamicForm'): Observable<FormGroup> {
        this.loading$.next(true);
        this.error$.next(null);

        // Use ApiService instead of HttpClient
        // Add query parameters if needed
        const params = this.apiService.buildParams({ format: 'json' });
        
        return this.apiService.get<any>(apiEndpoint, { params }).pipe(
            tap(response => {
                console.log('API Response received:', response);
                this.formMetadata$.next({
                    form_id: response.form_id,
                    form_title: response.form_title,
                    shared_configs: response.shared_configs
                });
            }),
            map(response => {
                if (response.structure) {
                    console.log('Transforming API structure:', response.structure);
                    const _transformedForm = this.mapApiToFormDefinition(response.structure);
                    this.formQuestions$.next(_transformedForm);
                    
                    return _transformedForm;
                }
                console.warn('No structure found in API response');
                return [];
            }),
            switchMap(formData => this.initFormBuild(formData)),
            tap(form => {
                console.log('Form successfully built:', form);
                this.currentForm$.next(form);
                this.loading$.next(false);
            }),
            catchError(error => {
                console.error('Error in generateForm:', error);
                
                // Handle the structured error from ApiService
                const errorMessage = error.message || 'An error occurred while generating the form';
                this.error$.next(errorMessage);
                this.loading$.next(false);
                
                // Return empty form instead of throwing error to prevent app crash
                const emptyForm = new FormGroup({});
                this.currentForm$.next(emptyForm);
                return of(emptyForm);
            })
        );
    }

    private initFormBuild(data: FormGroupBase<any>[] | QuestionBase<any>[]): Observable<FormGroup> {
        console.log('Initializing form build with data:', data);
        
        this.formModelService.processFormStructure(data);
        this.formModelService.emitCurrentFormStructure();

        return this.formModelService.getFormStructure();
    }

    // FormOrchestrationService.ts additions
private mapApiToFormDefinition(apiData: any[]): FormGroupBase<any>[] | QuestionBase<any>[] {
    console.log('Mapping API data to form definition:', apiData);
    
    return apiData.map(item => {
        // Transform field types
        if (item.field_type) {
            item.field_type = this.mapFieldType(item.field_type, item.choices);
        }

        // Handle expandable categories
        if (item.expandable && item.fields) {
            // Initialize with min_instances (default 1)
            const minInstances = item.min_instances || 1;
            const expandedFields: any[] = [];
            
            for (let i = 1; i <= minInstances; i++) {
                const instanceFields = item.fields.map((field: any) => ({
                    ...field,
                    key: field.key.replace('{index}', i.toString()),
                    label: field.key_template ? `${field.key_template} ${i}` : field.label
                }));
                expandedFields.push(...instanceFields);
            }
            
            item.fields = expandedFields;
            item.current_instances = minInstances;
        }

        // Recursively process nested fields
        if (item.fields && Array.isArray(item.fields)) {
            item.fields = this.mapApiToFormDefinition(item.fields);
        }
        
        return item;
    });
}

    private mapFieldType(fieldType: string, choices?: any[]): string {
        const fieldTypeMapping: { [key: string]: string } = {
            'select': 'dropdown',
            'textarea': 'textbox',
            'checkbox': 'checkbox',
            'datetime': 'datetime',
            'number': 'textbox',
            'text': 'textbox',
            'email': 'textbox'
        };
        
        return fieldTypeMapping[fieldType] || 'textbox';
    }

    createForm(formDefinition: FormGroupBase<any>[], formName: string = 'customForm'): Observable<FormGroup> {
        console.log('Creating form with definition:', formDefinition);
        this.loading$.next(true);

        return this.initFormBuild(formDefinition).pipe(
            tap(formGroup => {
                console.log('Form created successfully:', formGroup);
                this.currentForm$.next(formGroup);
                this.loading$.next(false);
            }),
            catchError(error => {
                console.error('Error creating form:', error);
                const errorMessage = error.message || 'An error occurred while creating the form';
                this.error$.next(errorMessage);
                this.loading$.next(false);
                
                // Return empty form instead of throwing
                const emptyForm = new FormGroup({});
                this.currentForm$.next(emptyForm);
                return of(emptyForm);
            })
        );
    }

    // Existing observable getters remain unchanged
    getFormQuestions(): Observable<FormGroupBase<any>[] | QuestionBase<any>[]> {
        return this.formQuestions$.asObservable();
    }

    getCurrentForm(): Observable<FormGroup> {
        return this.currentForm$.asObservable();
    }

    getFormMetadata(): Observable<any> {
        return this.formMetadata$.asObservable();
    }

    isLoading(): Observable<boolean> {
        return this.loading$.asObservable();
    }

    getError(): Observable<string | null> {
        return this.error$.asObservable();
    }

    resetForm(): void {
        const currentForm = this.currentForm$.getValue();
        if (currentForm) {
            currentForm.reset();
        }
    }

    /**
     * Check if the API service is available
     */
    checkApiHealth(): Observable<boolean> {
        return this.apiService.healthCheck().pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    /**
     * Get environment information from ApiService
     */
    getEnvironmentInfo() {
        return this.apiService.getEnvironmentInfo();
    }
}
