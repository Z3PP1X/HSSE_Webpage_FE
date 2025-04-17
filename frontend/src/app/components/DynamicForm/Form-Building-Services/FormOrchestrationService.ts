import { namedReferences } from './../../../../../node_modules/html-entities/src/named-references';
import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable, BehaviorSubject, of, throwError } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

import { FormModelService } from "./FormModelService";
import { QuestionBase } from "../question-base";
import { FormGroupBase } from "../Form/form/form-group-base";

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
    ) {}

    generateForm(apiEndpoint: string, formName: string = 'dynamicForm'): Observable<FormGroup> {
        this.loading$.next(true);
        this.error$.next(null);

        return this.httpclient.get<any>(apiEndpoint).pipe(
            tap(response => {

              console.log("Response: ",response)

                this.formMetadata$.next({
                    form_id: response.form_id,
                    form_title: response.form_title,
                    shared_configs: response.shared_configs
                });
            }),
            map(response => {
                if (response.structure) {
                    response.structure.forEach((category: any) => {
                        if (category.fields) {
                            category.fields = category.fields.map((field: any) => {

                                return {
                                    key: field.name,
                                    label: field.label,
                                    required: field.required,
                                    order: field.order || 1,
                                    controlType: this.mapFieldType(field.field_type, field.choices),
                                    type: field.field_type,
                                    options: field.choices ? field.choices.map((c: any) => ({
                                        key: c.label,
                                        value: c.value
                                    })) : [],
                                    category: category.key
                                };
                            });
                        }
                    });
                    return response.structure;
                }
                return [];
            }),
            switchMap(formData => this.formModelService.processFormStructure(formData)),
        );
    }

    private mapFieldType(fieldType: string, choices?: any[]): string {
        switch(fieldType) {
            case 'select':
                return 'dropdown';
            case 'textarea':
                return 'textarea';
            case 'checkbox':
                return 'checkbox';
            case 'datetime':
                return 'datetime';
            case 'number':
                if (choices && choices.length) {
                    return 'dropdown';
                }
                return 'textbox';
            default:
                return 'textbox';
        }
    }

    getFormMetadata(): Observable<any> {
        return this.formMetadata$.asObservable();
    }

    private structureFormData(
        questions: QuestionBase<any>[],
        formName: string
    ): Observable<FormGroupBase<any>[]> {

        const categorizedQuestions = new Map<string, QuestionBase<any>[]>();
        const uncategorizedQuestions: QuestionBase<any>[] = [];

        questions.forEach(question => {
            if (question.category) {
                if (!categorizedQuestions.has(question.category)) {
                    categorizedQuestions.set(question.category, []);
                }
                categorizedQuestions.get(question.category)?.push(question);
            } else {
                uncategorizedQuestions.push(question);
            }
        });
        const formStructure: FormGroupBase<any>[] = [];

        categorizedQuestions.forEach((categoryQuestions, categoryName) => {
            formStructure.push({
                key: categoryName,
                isCategory: true,
                fields: categoryQuestions
            } as FormGroupBase<any>);
        });

        if (uncategorizedQuestions.length > 0) {
            formStructure.push({
                key: formName,
                isCategory: false,
                fields: uncategorizedQuestions
            } as FormGroupBase<any>);
        }
        return of(formStructure);
    }

    createForm(formDefinition: FormGroupBase<any>[], formName: string = 'customForm'): Observable<FormGroup> {
        this.loading$.next(true);

        return this.formModelService.processFormStructure(formDefinition).pipe(
            tap(formGroup => {
                this.currentForm$.next(formGroup);
                this.loading$.next(false);
            }),
            catchError(error => {
                this.loading$.next(false);
                this.error$.next(`Error creating form: ${error.message || error}`);
                return throwError(() => error);
            })
        );
    }

    getCurrentForm(): Observable<FormGroup> {
        return this.currentForm$.asObservable();
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
