import { Injectable } from "@angular/core";
import { FormGroup, FormArray } from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";
import { QuestionBase } from "../question-base";
import { FormGroupBase } from "../Form/form/form-group-base";
import { FormBuilderService } from "./FormBuilderService";
import { of } from "rxjs";
import { map } from "rxjs/operators";




@Injectable({
    providedIn: 'root'
})
export class FormModelService {
    private formStructure: FormGroup = new FormGroup({});
    private formStructure$ = new BehaviorSubject<FormGroup>(this.formStructure);
    private questions: any = [];
    private categoryInstances = new Map<string, number>();

    private categories: string[] = [];
    private categoryMap = new Map<string, FormGroup>();

    constructor(private formBuilderService: FormBuilderService) {}

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
             
              const formArray = this.formBuilderService.createFormArray();

              
              const targetContainer = currentCategory && this.categoryMap.has(currentCategory)
                ? this.categoryMap.get(currentCategory)!
                : this.formStructure;

              targetContainer.addControl(element.key, formArray);

              
              if (element.fields && element.fields.length > 0) {
                const questionFields = element.fields.filter(field =>
                  !this.isFormGroup(field)) as QuestionBase<any>[];

                if (questionFields.length > 0) {
                  this.formBuilderService.addItemToFormArray(formArray, questionFields).subscribe();
                }

              
                const nestedGroups = element.fields.filter(field =>
                  this.isFormGroup(field)) as FormGroupBase<any>[];

                if (nestedGroups.length > 0) {
              
                  this.buildFormHierarchy(nestedGroups, currentCategory);
                }
              }
            } else {
              
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

  addControl(key: string, control: any, parentCategory?: string): void {
    const targetContainer = parentCategory && this.categoryMap.has(parentCategory)
        ? this.categoryMap.get(parentCategory)!
        : this.formStructure;

    targetContainer.addControl(key, control);
}

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

addInstanceToExpandableCategory(categoryKey: string, templateFields: QuestionBase<any>[])
  : Observable<QuestionBase<any>[]> {
  const categoryGroup = this.getCategory(categoryKey);
  if (!categoryGroup) throw new Error(`Category ${categoryKey} not found`);
  const currentInstance = this.incrementCategoryInstance(categoryKey);

  const indexedFields = templateFields.map(field => ({
    ...field,
    key: field.key.replace('{index}', currentInstance.toString()),
    label: field.key_template
      ? `${field.key_template} ${currentInstance}`
      : `${field.label} ${currentInstance}`
  })) as QuestionBase<any>[];

  return this.formBuilderService
    .addQuestionToGroup(categoryGroup, indexedFields)
    .pipe(map(() => indexedFields));
}

removeInstanceFromExpandableCategory(categoryKey: string, instanceIndex: number): void {
  const categoryGroup = this.getCategory(categoryKey);
  if (!categoryGroup) return;
  
  // Remove controls for this instance
  const fieldsToRemove = Object.keys(categoryGroup.controls)
    .filter(key => key.endsWith(`_${instanceIndex}`));
  
  fieldsToRemove.forEach(fieldKey => {
    categoryGroup.removeControl(fieldKey);
  });
  
  this.decrementCategoryInstance(categoryKey);
}

// Check if category can add more instances
canAddInstance(category: FormGroupBase<any>): boolean {
  if (!category.expandable) return false;
  
  const currentCount = this.getCategoryInstanceCount(category.key);
  const maxInstances = category.max_instances || Infinity;
  
  return currentCount < maxInstances;
}

// Check if category can remove instances
canRemoveInstance(category: FormGroupBase<any>): boolean {
  if (!category.expandable) return false;
  
  const currentCount = this.getCategoryInstanceCount(category.key);
  const minInstances = category.min_instances || 0;
  
  return currentCount > minInstances;
}

incrementCategoryInstance(categoryKey: string): number {
  const current = this.getCategoryInstanceCount(categoryKey);
  const newCount = current + 1;
  this.setCategoryInstanceCount(categoryKey, newCount);
  return newCount;
}

decrementCategoryInstance(categoryKey: string): number {
  const current = this.getCategoryInstanceCount(categoryKey);
  const newCount = Math.max(0, current - 1);
  this.setCategoryInstanceCount(categoryKey, newCount);
  return newCount;
}

getCategoryInstanceCount(categoryKey: string): number {
  return this.categoryInstances.get(categoryKey) || 0;
}

setCategoryInstanceCount(categoryKey: string, count: number): void {
  this.categoryInstances.set(categoryKey, count);
}

getCategory(key: string): FormGroup | null {
    return this.categoryMap.get(key) || null;
}

getCategories(): string[] {
    return [...this.categories];
}

isFormGroup<T>(item: QuestionBase<T> | FormGroupBase<T>): item is FormGroupBase<T> {
    return (item as FormGroupBase<T>).fields !== undefined;
}

emitCurrentFormStructure(): void {
    this.formStructure$.next(this.formStructure);
}

getFormStructure(): Observable<FormGroup> {
  return this.formStructure$.asObservable();
}

getCurrentFormStructure(): FormGroup {
  return this.formStructure;
}
}
