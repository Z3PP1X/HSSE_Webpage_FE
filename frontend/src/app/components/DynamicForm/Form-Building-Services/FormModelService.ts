import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";
import { QuestionBase } from "../question-base";
import { FormGroupBase } from "../Form/form/form-group-base";
import { FormBuilderService } from "./FormBuilderService";

@Injectable({
    providedIn: 'root'
})
export class FormModelService {
    private formStructure: FormGroup = new FormGroup({});
    private formStructure$ = new BehaviorSubject<FormGroup>(this.formStructure);
    
    private categories: string[] = [];
    private categoryMap = new Map<string, FormGroup>();

    constructor(private formBuilderService: FormBuilderService) {}

    /**
     * Processes form structure and builds category-based form groups
     */
    processFormStructure(data: FormGroupBase<any>[] | QuestionBase<any>[]): Observable<FormGroup> {
        this.formStructure = new FormGroup({});
        this.categories = [];
        this.categoryMap.clear();
        
        this.buildFormHierarchy(data);
        this.formStructure$.next(this.formStructure);
        
        console.log('Final form structure:', this.formStructure);
        return this.formStructure$.asObservable();
    }

    /**
     * Builds form hierarchy from form definition data
     */
    private buildFormHierarchy(data: FormGroupBase<any>[] | QuestionBase<any>[], parentCategory?: string) {
        let currentCategory = parentCategory || '';

        data.forEach(element => {
            if (this.isFormGroup(element)) {
                if (element.isCategory) {
                    // Handle category
                    const categoryForm = this.addCategory(element.key);
                    currentCategory = element.key;
                    
                    // Process fields in this category
                    if (element.fields && element.fields.length > 0) {
                        this.buildFormHierarchy(element.fields, currentCategory);
                    }
                } else {
                    // Handle form group that isn't a category
                    const targetCategory = parentCategory || currentCategory;
                    if (targetCategory) {
                        const questionFields = element.fields.filter(field => !this.isFormGroup(field)) as QuestionBase<any>[];
                        this.addItemToCategory(targetCategory, element.key, questionFields);
                    } else {
                        // Add to root if no category
                        const questionFields = element.fields.filter(field => !this.isFormGroup(field)) as QuestionBase<string>[];
                        const groupForm = this.formBuilderService.toFormGroup(questionFields);
                        this.formStructure.addControl(element.key, groupForm);
                    }
                }
            } else {
                // Handle individual question
                const targetCategory = currentCategory;
                if (targetCategory && this.categoryMap.has(targetCategory)) {
                    const categoryGroup = this.categoryMap.get(targetCategory);
                    if (categoryGroup) {
                        this.formBuilderService.addQuestionToGroup(categoryGroup, [element])
                            .subscribe();
                    }
                } else {
                    // Add to root form if no category
                    this.formBuilderService.addQuestionToGroup(this.formStructure, [element])
                        .subscribe();
                }
            }
        });
    }

    /**
     * Adds a category to the form structure
     */
    addCategory(key: string): FormGroup {
        if (!this.categoryMap.has(key)) {
            const categoryForm = new FormGroup({});
            this.formStructure.addControl(key, categoryForm);
            this.categoryMap.set(key, categoryForm);
            
            if (!this.categories.includes(key)) {
                this.categories.push(key);
            }
        }
        
        return this.categoryMap.get(key) as FormGroup;
    }

    /**
     * Adds an item to a category
     */
    addItemToCategory(categoryKey: string, itemKey: string, questions: QuestionBase<any>[] = []): Observable<FormGroup> {
        const categoryGroup = this.addCategory(categoryKey);
        
        if (questions.length > 0) {
            return this.formBuilderService.addQuestionToGroup(categoryGroup, questions);
        }
        
        return new BehaviorSubject<FormGroup>(categoryGroup).asObservable();
    }

    /**
     * Gets the current form structure as an observable
     */
    getFormStructure(): Observable<FormGroup> {
        return this.formStructure$.asObservable();
    }

    /**
     * Gets a specific category form group
     */
    getCategory(key: string): FormGroup | null {
        return this.categoryMap.get(key) || null;
    }

    /**
     * Type guard to check if an item is a FormGroupBase
     */
    private isFormGroup<T>(item: QuestionBase<T> | FormGroupBase<T>): item is FormGroupBase<T> {
        return (item as FormGroupBase<T>).fields !== undefined;
    }
}