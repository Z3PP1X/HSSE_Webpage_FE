import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormGroup, FormArray } from "@angular/forms";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";

import { QuestionBase } from "../question-base";
import { FormGroupBase } from "../Form/form/form-group-base";
import { FormModelService } from "./FormModelService";
import { FormBuilderService } from "./FormBuilderService";

@Injectable({
    providedIn: 'root'
})
export class FormOrchestrationService {
    private currentForm$ = new BehaviorSubject<FormGroup>(new FormGroup({}));
    private loading$ = new BehaviorSubject<boolean>(false);
    private error$ = new BehaviorSubject<string | null>(null);
    private formMetadata$ = new BehaviorSubject<any>(null);

    constructor(
        private httpclient: HttpClient,
        private formModelService: FormModelService,
        private formBuilderService: FormBuilderService
    ) {}

    /**
     * Generate a form from an API endpoint
     */
    generateForm(apiEndpoint: string, formName: string = 'dynamicForm'): Observable<FormGroup> {
        this.loading$.next(true);
        this.error$.next(null);

        return this.httpclient.get<any>(apiEndpoint).pipe(
            tap(response => {
                console.log("Response: ", response);
                this.formMetadata$.next({
                    form_id: response.form_id,
                    form_title: response.form_title,
                    shared_configs: response.shared_configs
                });
            }),
            map(response => {
                if (response.structure) {
                    return this.mapApiToFormDefinition(response.structure);
                }
                return [];
            }),
            switchMap(formData => this.processFormStructure(formData)),
            tap(form => {
                this.currentForm$.next(form);
                this.loading$.next(false);
            }),
            catchError(error => {
                this.error$.next(error.message || 'An error occurred while generating the form');
                this.loading$.next(false);
                throw error;
            })
        );
    }

    /**
     * Process form structure data and build the complete form
     */
    private processFormStructure(data: FormGroupBase<any>[] | QuestionBase<any>[]): Observable<FormGroup> {
        // Initialize the form structure
        this.formModelService.initFormStructure();

        // Build the hierarchical form structure
        this.buildFormHierarchy(data);

        // Emit and return the final form structure
        this.formModelService.emitCurrentFormStructure();
        return this.formModelService.getFormStructure();
    }

    /**
     * Map API data to our internal form definition format
     */
    private mapApiToFormDefinition(apiData: any[]): FormGroupBase<any>[] | QuestionBase<any>[] {
        return apiData.map(item => {
            // Map API field types to our control types
            if (item.type) {
                item.controlType = this.mapFieldType(item.type, item.choices);
            }

            // Handle nested fields recursively
            if (item.fields && Array.isArray(item.fields)) {
                item.fields = this.mapApiToFormDefinition(item.fields);
            }

            return item;
        });
    }

    /**
     * Map API field types to our internal control types
     */
    private mapFieldType(fieldType: string, choices?: any[]): string {
        switch(fieldType) {
            case 'select':
                return 'dropdown';
            case 'textarea':
                return 'textbox';
            case 'checkbox':
                return 'checkbox';
            case 'datetime':
                return 'datetime';
            case 'number':
                return 'textbox';
            default:
                return 'textbox';
        }
    }

    /**
     * Build the form hierarchy by recursively processing form groups and questions
     */
    private buildFormHierarchy(data: FormGroupBase<any>[] | QuestionBase<any>[], parentCategory?: string): void {
        data.forEach(element => {
            if (this.formModelService.isFormGroup(element)) {
                if (element.isCategory) {
                    // Handle category form groups
                    const categoryForm = this.formModelService.addCategory(element.key);
                    const categoryKey = element.key;

                    if (element.fields && element.fields.length > 0) {
                        this.buildFormHierarchy(element.fields, categoryKey);
                    }
                } else if (element.isArray) {
                    // Handle form arrays
                    const formArray = this.formBuilderService.createFormArray();
                    this.formModelService.addControl(element.key, formArray, parentCategory);

                    if (element.fields && element.fields.length > 0) {
                        // Process questions for array items
                        const questionFields = element.fields.filter(field =>
                            !this.formModelService.isFormGroup(field)) as QuestionBase<any>[];

                        if (questionFields.length > 0) {
                            this.formBuilderService.addItemToFormArray(formArray, questionFields).subscribe();
                        }

                        // Process nested groups
                        const nestedGroups = element.fields.filter(field =>
                            this.formModelService.isFormGroup(field)) as FormGroupBase<any>[];

                        if (nestedGroups.length > 0) {
                            this.buildFormHierarchy(nestedGroups, parentCategory);
                        }
                    }
                } else {
                    // Handle regular form groups
                    if (element.fields && element.fields.length > 0) {
                        const questionFields = element.fields.filter(field =>
                            !this.formModelService.isFormGroup(field)) as QuestionBase<any>[];

                        if (questionFields.length > 0) {
                            this.formBuilderService.formQuestions(questionFields).subscribe(
                                processedQuestions => {
                                    const group = this.formBuilderService.toFormGroup(processedQuestions);
                                    this.formModelService.addControl(element.key, group, parentCategory);
                                }
                            );
                        } else {
                            // Create empty group if no questions
                            const emptyGroup = new FormGroup({});
                            this.formModelService.addControl(element.key, emptyGroup, parentCategory);
                        }

                        // Process nested groups
                        const nestedGroups = element.fields.filter(field =>
                            this.formModelService.isFormGroup(field)) as FormGroupBase<any>[];

                        if (nestedGroups.length > 0) {
                            this.buildFormHierarchy(nestedGroups, element.key);
                        }
                    } else {
                        // Empty group
                        const emptyGroup = new FormGroup({});
                        this.formModelService.addControl(element.key, emptyGroup, parentCategory);
                    }
                }
            } else {
                // Handle individual questions
                this.formBuilderService.formQuestions([element]).subscribe(
                    processedQuestions => {
                        if (processedQuestions.length > 0) {
                            const targetCategory = parentCategory;
                            if (targetCategory && this.formModelService.getCategory(targetCategory)) {
                                const categoryGroup = this.formModelService.getCategory(targetCategory)!;
                                this.formBuilderService.addQuestionToGroup(categoryGroup, processedQuestions).subscribe();
                            } else {
                                this.formBuilderService.addQuestionToGroup(
                                    this.formModelService.getCurrentFormStructure(),
                                    processedQuestions
                                ).subscribe();
                            }
                        }
                    }
                );
            }
        });
    }

    /**
     * Create a form with a predefined structure
     */
    createForm(formDefinition: FormGroupBase<any>[], formName: string = 'customForm'): Observable<FormGroup> {
        this.loading$.next(true);

        return this.processFormStructure(formDefinition).pipe(
            tap(formGroup => {
                this.currentForm$.next(formGroup);
                this.loading$.next(false);
            }),
            catchError(error => {
                this.error$.next(error.message || 'An error occurred while creating the form');
                this.loading$.next(false);
                throw error;
            })
        );
    }

    /**
     * Structure form data into categories
     */
    private structureFormData(
        questions: QuestionBase<any>[],
        formName: string
    ): Observable<FormGroupBase<any>[]> {
        const categorizedQuestions = new Map<string, QuestionBase<any>[]>();
        const uncategorizedQuestions: QuestionBase<any>[] = [];

        // Sort questions into categories
        questions.forEach(question => {
            if (question.category) {
                if (!categorizedQuestions.has(question.category)) {
                    categorizedQuestions.set(question.category, []);
                }
                categorizedQuestions.get(question.category)!.push(question);
            } else {
                uncategorizedQuestions.push(question);
            }
        });

        const formStructure: FormGroupBase<any>[] = [];

        // Create category groups
        categorizedQuestions.forEach((categoryQuestions, categoryName) => {
            formStructure.push({
                key: categoryName,
                isCategory: true,
                fields: categoryQuestions,
                title: categoryName  // Using categoryName as the title, adjust as needed
            });
        });

        // Add uncategorized questions to main form
        if (uncategorizedQuestions.length > 0) {
            formStructure.push({
                key: formName,
                isCategory: false,
                fields: uncategorizedQuestions,
                title: formName
            });
        }

        return of(formStructure);
    }

    // Accessors for form state
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
}
