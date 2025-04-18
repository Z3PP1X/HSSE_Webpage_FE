import { Injectable } from "@angular/core";
import { FormGroup, FormArray } from "@angular/forms";
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
     * Initialize a new form structure
     */
    initFormStructure(): void {
        this.formStructure = new FormGroup({});
        this.categories = [];
        this.categoryMap.clear();
        this.formStructure$.next(this.formStructure);
    }

    /**
     * Get the current form structure as an Observable
     */
    getFormStructure(): Observable<FormGroup> {
        return this.formStructure$.asObservable();
    }

    /**
     * Get the current form structure directly
     */
    getCurrentFormStructure(): FormGroup {
        return this.formStructure;
    }

    /**
     * Add a form control to the structure
     */
    addControl(key: string, control: any, parentCategory?: string): void {
        const targetContainer = parentCategory && this.categoryMap.has(parentCategory)
            ? this.categoryMap.get(parentCategory)!
            : this.formStructure;

        targetContainer.addControl(key, control);
    }

    /**
     * Create or get a category form group
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
     * Get a specific category
     */
    getCategory(key: string): FormGroup | null {
        return this.categoryMap.get(key) || null;
    }

    /**
     * Get all available categories
     */
    getCategories(): string[] {
        return [...this.categories];
    }

    /**
     * Type guard to check if an item is a form group
     */
    isFormGroup<T>(item: QuestionBase<T> | FormGroupBase<T>): item is FormGroupBase<T> {
        return (item as FormGroupBase<T>).fields !== undefined;
    }

    /**
     * Update the BehaviorSubject with the current form structure
     */
    emitCurrentFormStructure(): void {
        this.formStructure$.next(this.formStructure);
    }

    processFormStructure(data: FormGroupBase<any>[] | QuestionBase<any>[]): Observable<FormGroup> {
        this.formStructure = new FormGroup({});
        this.categories = [];
        this.categoryMap.clear();

        this.buildFormHierarchy(data);
        this.formStructure$.next(this.formStructure);

        return this.formStructure$.asObservable();
    }

    private buildFormHierarchy(data: FormGroupBase<any>[] | QuestionBase<any>[], parentCategory?: string) {
        let currentCategory = parentCategory || '';

        data.forEach(element => {
          if (this.isFormGroup(element)) {
            if (element.isCategory) {
              const categoryForm = this.addCategory(element.key);
              currentCategory = element.key;

              if (element.fields && element.fields.length > 0) {
                this.buildFormHierarchy(element.fields, currentCategory);
              }
            } else if (element.isArray) {
              // Handle form arrays
              const formArray = this.formBuilderService.createFormArray();

              // Add the form array to the appropriate container
              const targetContainer = currentCategory && this.categoryMap.has(currentCategory)
                ? this.categoryMap.get(currentCategory)!
                : this.formStructure;

              targetContainer.addControl(element.key, formArray);

              // Add initial item if fields are provided
              if (element.fields && element.fields.length > 0) {
                const questionFields = element.fields.filter(field =>
                  !this.isFormGroup(field)) as QuestionBase<any>[];

                if (questionFields.length > 0) {
                  this.formBuilderService.addItemToFormArray(formArray, questionFields).subscribe();
                }

                // Handle nested form groups within array items
                const nestedGroups = element.fields.filter(field =>
                  this.isFormGroup(field)) as FormGroupBase<any>[];

                if (nestedGroups.length > 0) {
                  // Process nested groups
                  this.buildFormHierarchy(nestedGroups, currentCategory);
                }
              }
            } else {
              // Handle regular form groups
              const targetCategory = parentCategory || currentCategory;
              if (targetCategory) {
                const questionFields = element.fields.filter(field => !this.isFormGroup(field)) as QuestionBase<any>[];
                this.addItemToCategory(targetCategory, questionFields);
              } else {
                const questionFields = element.fields.filter(field => !this.isFormGroup(field)) as QuestionBase<string>[];
                const groupForm = this.formBuilderService.toFormGroup(questionFields);
                this.formStructure.addControl(element.key, groupForm);
              }
            }
          } else {
            // Handle individual questions
            const targetCategory = currentCategory;
            if (targetCategory && this.categoryMap.has(targetCategory)) {
              const categoryGroup = this.categoryMap.get(targetCategory);
              if (categoryGroup) {
                this.formBuilderService.addQuestionToGroup(categoryGroup, [element]).subscribe();
              }
            } else {
              this.formBuilderService.addQuestionToGroup(this.formStructure, [element]).subscribe();
            }
          }
        });
      }

    addItemToCategory(categoryKey: string, questions: QuestionBase<any>[] = []): Observable<FormGroup> {
        const categoryGroup = this.addCategory(categoryKey);

        if (questions.length > 0) {
            return this.formBuilderService.addQuestionToGroup(categoryGroup, questions);
        }

        return new BehaviorSubject<FormGroup>(categoryGroup).asObservable();
    }
}
