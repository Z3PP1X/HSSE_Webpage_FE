import { Injectable } from "@angular/core";
import { FormGroup, FormArray } from "@angular/forms";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
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
        console.log('🔄 FormOrchestrationService.generateForm called with:', apiEndpoint);
        this.loading$.next(true);
        this.error$.next(null);

        const params = this.apiService.buildParams({ format: 'json' });
        
        return this.apiService.get<any>(apiEndpoint, { params }).pipe(
            map(response => {
                console.log('📥 Raw API response in generateForm:', response);
                console.log('Shared configs found:', response.shared_configs);
                
                // Store the complete metadata including shared_configs
                this.formMetadata$.next(response);
                
                // Process the structure and apply ajax configs
                const processedStructure = this.mapApiToFormDefinition(response.structure, response.shared_configs);
                console.log('📤 Processed structure:', processedStructure);
                
                this.formQuestions$.next(processedStructure);
                return processedStructure;
            }),
            switchMap(data => this.initFormBuild(data)),
            tap(() => {
                console.log('✅ Form generation completed');
                this.loading$.next(false);
            }),
            catchError(error => {
                console.error('💥 Error generating form:', error);
                this.error$.next('Failed to generate form');
                this.loading$.next(false);
                return throwError(() => error);
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
private mapApiToFormDefinition(apiData: any[], sharedConfigs?: any): FormGroupBase<any>[] | QuestionBase<any>[] {
    console.log('🔄 mapApiToFormDefinition called');
    console.log('Input apiData:', apiData);
    console.log('Input sharedConfigs:', sharedConfigs);
    
    return apiData.map(item => {
        console.log('Processing item:', item.key);
        
        // Transform field types
        if (item.field_type) {
            item.field_type = this.mapFieldType(item.field_type, item.choices);
        }

        // Process fields within categories
        if (item.fields && Array.isArray(item.fields)) {
            item.fields = item.fields.map((field: any) => {
                console.log(`Processing field: ${field.key}, type: ${field.field_type}`);
                
                // Handle ajax_select fields
                if (field.field_type === 'ajax_select' && field.ajax_config && sharedConfigs?.ajax_configs) {
                    console.log(`🔍 Found ajax_select field: ${field.key} with config: ${field.ajax_config}`);
                    
                    const ajaxConfig = sharedConfigs.ajax_configs[field.ajax_config];
                    if (ajaxConfig) {
                        console.log(`✅ Applying ajax config:`, ajaxConfig);
                        // Merge ajax config into the field
                        field.endpoint = ajaxConfig.endpoint;
                        field.method = ajaxConfig.method || 'GET';
                        field.triggerEvents = ajaxConfig.triggerEvents || ['input', 'focus'];
                        field.debounceTime = ajaxConfig.debounceTime || 300;

                        if (field.endpoint) {
                            // Keep only path relative to /api if baseUrl ends with /api
                            if (this.apiService.getEnvironmentInfo().apiBaseUrl.endsWith('/api')) {
                                field.endpoint = field.endpoint.replace(/^\/+/, '');
                                field.endpoint = field.endpoint.replace(/^api\/+/, ''); 
                            }
                        }
                        
                        console.log(`🎯 Field after config merge:`, {
                            key: field.key,
                            endpoint: field.endpoint,
                            field_type: field.field_type
                        });
                    } else {
                        console.warn(`❌ Ajax config '${field.ajax_config}' not found in shared configs`);
                    }
                }
                return field;
            });
        }

        // Handle expandable categories
        if (item.expandable && item.fields) {
            // Initialize with min_instances (default 1)
            const minInstances = item.min_instances || 1;
            const expandedFields: any[] = [];
            
            for (let i = 1; i <= minInstances; i++) {
                const instanceFields = item.fields.map((field: any) => {
                    const newField = {
                        ...field,
                        key: field.key.replace('{index}', i.toString()),
                        label: field.key_template ? `${field.key_template} ${i}` : field.label
                    };
                    
                    // Apply ajax config to expanded fields too
                    if (newField.field_type === 'ajax_select' && newField.ajax_config && sharedConfigs?.ajax_configs) {
                        const ajaxConfig = sharedConfigs.ajax_configs[newField.ajax_config];
                        if (ajaxConfig) {
                            newField.endpoint = ajaxConfig.endpoint;
                            newField.method = ajaxConfig.method || 'GET';
                            newField.triggerEvents = ajaxConfig.triggerEvents || ['input', 'focus'];
                            newField.debounceTime = ajaxConfig.debounceTime || 300;

                            if (newField.endpoint) {
                                // Keep only path relative to /api if baseUrl ends with /api
                                if (this.apiService.getEnvironmentInfo().apiBaseUrl.endsWith('/api')) {
                                    newField.endpoint = newField.endpoint.replace(/^\/+/, '');
                                    newField.endpoint = newField.endpoint.replace(/^api\/+/, ''); 
                                }
                            }
                        }
                    }
                    
                    return newField;
                });
                expandedFields.push(...instanceFields);
            }
            
            item.fields = expandedFields;
            item.current_instances = minInstances;
        }
        
        return item;
    });
}

    private mapFieldType(fieldType: string, choices?: any[]): string {
        const fieldTypeMapping: { [key: string]: string } = {
            'select': 'dropdown',
            'ajax_select': 'ajax_select',
            'textarea': 'textbox',
            'checkbox': 'checkbox',
            'datetime': 'datetime',
            'number': 'textbox',
            'text': 'textbox',
            'email': 'textbox'
        };
        
        return fieldTypeMapping[fieldType] || fieldType;
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
