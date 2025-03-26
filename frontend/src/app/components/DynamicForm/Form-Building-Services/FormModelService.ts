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


    processFormStructure(data: FormGroupBase<any>[] | QuestionBase<any>[]): Observable<FormGroup> {
        this.formStructure = new FormGroup({});
        this.categories = [];
        this.categoryMap.clear();

        this.buildFormHierarchy(data);
        this.formStructure$.next(this.formStructure);

        console.log('Final form structure:', this.formStructure);
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
                        this.formBuilderService.addQuestionToGroup(categoryGroup, [element])
                            .subscribe();
                    }
                } else {

                    this.formBuilderService.addQuestionToGroup(this.formStructure, [element])
                        .subscribe();
                }
            }
        });
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


    addItemToCategory(categoryKey: string, questions: QuestionBase<any>[] = []): Observable<FormGroup> {
        const categoryGroup = this.addCategory(categoryKey);

        if (questions.length > 0) {
            return this.formBuilderService.addQuestionToGroup(categoryGroup, questions);
        }

        return new BehaviorSubject<FormGroup>(categoryGroup).asObservable();
    }


    getFormStructure(): Observable<FormGroup> {
        return this.formStructure$.asObservable();
    }


    getCategory(key: string): FormGroup | null {
        return this.categoryMap.get(key) || null;
    }


    private isFormGroup<T>(item: QuestionBase<T> | FormGroupBase<T>): item is FormGroupBase<T> {
        return (item as FormGroupBase<T>).fields !== undefined;
    }
}
