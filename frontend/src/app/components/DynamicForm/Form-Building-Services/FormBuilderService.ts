import { Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators, FormArray } from "@angular/forms";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

import { QuestionBase } from "../question-base";
import { DropdownQuestion } from "../questions/dropdown";
import { TextboxQuestion } from "../questions/textbox";
import { DateTimeQuestion } from "../questions/datetime";
import { LocationQuestion } from "../questions/location";
import { ContactDataQuestion } from "../questions/contact-data";
import { AdressFieldQuestion } from "../questions/adressfield";

@Injectable({
    providedIn: 'root'
})
export class FormBuilderService {
    constructor() {}

    setFormGroup(groupName: string): FormGroup {
        return new FormGroup({ [groupName]: new FormGroup({}) });
    }

    toFormGroup(questions: QuestionBase<string>[]): FormGroup {
        const group: Record<string, FormControl> = {};

        questions?.forEach((question) => {
            if (question.key) {
                const validators = [];

                if (question.required) {
                    validators.push(Validators.required);
                }

                // Add more validators based on question properties
                if (question.type === 'email') {
                    validators.push(Validators.email);
                }
                if (question.type === 'number' || question.controlType === 'integer') {
                    validators.push(Validators.pattern('^[0-9]*$'));
                }

                const control = new FormControl(
                    question.value || '',
                    validators
                );

                group[question.key] = control;
            } else {
                console.error('Missing key for question:', question);
            }
        });

        return new FormGroup(group);
    }

    formQuestions(data: any[]): Observable<QuestionBase<any>[]> {
        const questions: QuestionBase<any>[] = [];

        for (const element of data) {
            const baseConfig = {
                title: element.title,
                key: element.key,
                label: element.label,
                type: element.type,
                required: element.required,
                order: element.order || 0,
                fetchOptions: element.fetchOptions,
                apiEndpoint: element.apiEndpoint,
                ajaxConfig: element.ajaxConfig,
                value: element.value,
                controlType: element.controlType,
                options: element.options,
                maxContacts: element.maxContacts,
                category: element.category
            };

            switch (element.controlType) {
                case "textbox":
                    questions.push(new TextboxQuestion({ ...baseConfig }));
                    break;
                case "contactdata":
                    questions.push(new ContactDataQuestion({ ...baseConfig }));
                    break;
                case "adressdata":
                    questions.push(new AdressFieldQuestion({ ...baseConfig }));
                    break;
                case "location":
                    questions.push(new LocationQuestion({ ...baseConfig }));
                    break;
                case "datetime":
                    questions.push(new DateTimeQuestion({ ...baseConfig }));
                    break;
                case "dropdown":
                    questions.push(new DropdownQuestion({ ...baseConfig, options: element.options || [] }));
                    break;
                default:
                    console.warn('Unknown controlType: ', element.controlType);
                    break;
            }
        }

        return of(questions.sort((a, b) => a.order - b.order));
    }

    addQuestionToGroup(group: FormGroup, questions: QuestionBase<string>[]): Observable<FormGroup> {
        return this.formQuestions(questions).pipe(
            map(processedQuestions => {
                const newControls = this.toFormGroup(processedQuestions);
                Object.keys(newControls.controls).forEach(key => {
                    group.addControl(key, newControls.get(key));
                });
                return group;
            })
        );
    }

    createForm(formName: string, questions: any[]): Observable<FormGroup> {
        const formGroup = this.setFormGroup(formName);
        const nestedGroup = formGroup.get(formName) as FormGroup;

        return this.addQuestionToGroup(nestedGroup, questions).pipe(
            map(() => formGroup)
        );
    }

    createFormArray(): FormArray<any> {
        return new FormArray<any>([]);
    }

    addItemToFormArray(formArray: FormArray, questions: QuestionBase<string>[]): Observable<FormArray> {
        return this.formQuestions(questions).pipe(
            map(processedQuestions => {
                const group = this.toFormGroup(processedQuestions);
                formArray.push(group);
                return formArray;
            })
        );
    }

    removeItemFromFormArray(formArray: FormArray, index: number): void {
        if (index >= 0 && index < formArray.length) {
            formArray.removeAt(index);
        }
    }
}
