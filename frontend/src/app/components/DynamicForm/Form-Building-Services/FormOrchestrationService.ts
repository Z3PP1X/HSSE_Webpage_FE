import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable, BehaviorSubject, of, throwError } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";

import { FormMetadataService } from "./FormMetadataService";
import { FormModelService } from "./FormModelService";
import { FormBuilderService } from "./FormBuilderService";
import { QuestionBase } from "../question-base";
import { FormGroupBase } from "../Form/form/form-group-base";

@Injectable({
    providedIn: 'root'
})
export class FormOrchestrationService {
    private currentForm$ = new BehaviorSubject<FormGroup>(new FormGroup({}));
    private loading$ = new BehaviorSubject<boolean>(false);
    private error$ = new BehaviorSubject<string | null>(null);

    constructor(
        private formMetadataService: FormMetadataService,
        private formModelService: FormModelService,
        private formBuilderService: FormBuilderService
    ) {}

    /**
     * Generates a form from metadata at the specified API endpoint
     */
    generateForm(apiEndpoint: string, formName: string = 'dynamicForm'): Observable<FormGroup> {
        this.loading$.next(true);
        this.error$.next(null);
        
        return this.formMetadataService.getFormMetadata(apiEndpoint).pipe(
            tap(questions => console.log('Metadata transformed to questions:', questions)),
            switchMap(questions => {
                // Group the questions by categories if needed
                return this.structureFormData(questions, formName);
            }),
            tap(formStructure => console.log('Form structure created:', formStructure)),
            switchMap(formStructure => {
                return this.formModelService.processFormStructure(formStructure);
            }),
            tap(formGroup => {
                this.currentForm$.next(formGroup);
                this.loading$.next(false);
            }),
            catchError(error => {
                this.loading$.next(false);
                this.error$.next(`Error generating form: ${error.message || error}`);
                return throwError(() => error);
            })
        );
    }

    /**
     * Creates a form structure from flat question list
     */
    private structureFormData(
        questions: QuestionBase<any>[], 
        formName: string
    ): Observable<FormGroupBase<any>[]> {
        // Group questions by category if available
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
        
        // Create form structure
        const formStructure: FormGroupBase<any>[] = [];
        
        // Add categorized questions
        categorizedQuestions.forEach((categoryQuestions, categoryName) => {
            formStructure.push({
                key: categoryName,
                isCategory: true,
                fields: categoryQuestions
            } as FormGroupBase<any>);
        });
        
        // Add uncategorized questions as a single form group if any exist
        if (uncategorizedQuestions.length > 0) {
            formStructure.push({
                key: formName,
                isCategory: false,
                fields: uncategorizedQuestions
            } as FormGroupBase<any>);
        }
        
        return of(formStructure);
    }

    /**
     * Creates a standalone form without metadata from an API
     */
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

    /**
     * Gets the current active form
     */
    getCurrentForm(): Observable<FormGroup> {
        return this.currentForm$.asObservable();
    }

    /**
     * Gets the loading state
     */
    isLoading(): Observable<boolean> {
        return this.loading$.asObservable();
    }

    /**
     * Gets any error that occurred
     */
    getError(): Observable<string | null> {
        return this.error$.asObservable();
    }

    /**
     * Resets the current form to initial values
     */
    resetForm(): void {
        const currentForm = this.currentForm$.getValue();
        if (currentForm) {
            currentForm.reset();
        }
    }
}