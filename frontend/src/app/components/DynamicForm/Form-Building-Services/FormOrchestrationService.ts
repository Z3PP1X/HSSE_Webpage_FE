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
    private formQuestions$ = new BehaviorSubject<FormGroupBase<any>[] | QuestionBase<any>[]>([]);

    constructor(
        private httpclient: HttpClient,
        private formModelService: FormModelService,
        
    ) {}


    generateForm(apiEndpoint: string, formName: string = 'dynamicForm'): Observable<FormGroup> {
        this.loading$.next(true);
        this.error$.next(null);

        return this.httpclient.get<any>(apiEndpoint).pipe(
            tap(response => {
                this.formMetadata$.next({
                    form_id: response.form_id,
                    form_title: response.form_title,
                    shared_configs: response.shared_configs
                });
            }),
            map(response => {
                if (response.structure) {
                    
                    const _transformedForm = this.mapApiToFormDefinition(response.structure)
                    this.formQuestions$.next(_transformedForm);
                    
                    return _transformedForm;
                }
                ;
                return [];
            }),
            switchMap(formData => this.initFormBuild(formData)),
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

    private initFormBuild(data: FormGroupBase<any>[] | QuestionBase<any>[]): Observable<FormGroup> {
        
        this.formModelService.processFormStructure(data);

        this.formModelService.emitCurrentFormStructure();

        return this.formModelService.getFormStructure();
    }

    private mapApiToFormDefinition(apiData: any[]): FormGroupBase<any>[] | QuestionBase<any>[] {
        return apiData.map(item => {

            if (item.field_type) {
                item.field_type = this.mapFieldType(item.field_type, item.choices);
            }

            if (item.fields && Array.isArray(item.fields)) {
                item.fields = this.mapApiToFormDefinition(item.fields);
            }
            return item;
        });
    }

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

    createForm(formDefinition: FormGroupBase<any>[], formName: string = 'customForm'): Observable<FormGroup> {
        this.loading$.next(true);

        return this.initFormBuild(formDefinition).pipe(
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
}
