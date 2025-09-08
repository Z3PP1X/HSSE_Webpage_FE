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
import { AjaxSelectQuestion } from "../questions/ajaxselect";

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

                if (question.field_type === 'email') {
                    validators.push(Validators.email);
                }
                if (question.field_type === 'number' || question.field_type === 'integer') {
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
            console.log('Processing element in FormBuilderService:', element);
            
            // Properly map choices/options to have consistent structure
            let mappedOptions = [];
            if (element.choices && Array.isArray(element.choices)) {
                mappedOptions = element.choices.map((choice: any) => ({
                    key: choice.value || choice.key,
                    value: choice.value || choice.key,
                    label: choice.label || choice.value || choice.key
                }));
            }

            const baseConfig = {
                title: element.title,
                key: element.key,
                label: element.label,
                field_type: element.field_type,
                required: element.required,
                order: element.order || 0,
                fetchOptions: element.fetchOptions,
                helpText: element.help_text,
                value: element.value,
                options: mappedOptions,
                category: element.category,
            };

            switch (element.field_type) {
                case "ajax_select":
                    console.log('Creating AjaxSelectQuestion for:', element.key);
                    questions.push(new AjaxSelectQuestion({ 
                        ...baseConfig,
                        ajax_config: element.ajax_config,
                        search_field: element.search_field,
                        display_field: element.display_field,
                        value_field: element.value_field,
                        endpoint: element.endpoint, // Make sure endpoint is passed
                        method: element.method,
                        triggerEvents: element.triggerEvents,
                        debounceTime: element.debounceTime,
                        choices: mappedOptions
                    }));
                    break;
                case "textbox":
                case "text": // Handle both textbox and text
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
                case "select":
                    questions.push(new DropdownQuestion({ 
                        ...baseConfig, 
                        choices: element.choices || element.options || [] 
                    }));
                    break;
                case "email":
                    questions.push(new TextboxQuestion({ ...baseConfig }));
                    break;
                case "number":
                    questions.push(new TextboxQuestion({ ...baseConfig }));
                    break;
                case "checkbox":
                    questions.push(new TextboxQuestion({ ...baseConfig })); // You might want a CheckboxQuestion
                    break;
                default:
                    console.warn('Unknown field_type: ', element.field_type);
                    // Fallback to textbox
                    questions.push(new TextboxQuestion({ ...baseConfig }));
                    break;
            }
        }

        return of(questions.sort((a, b) => a.order - b.order));
    }

    
    createFormArray(): FormArray<any> {
        return new FormArray<any>([]);
    }

    
    addQuestionToGroup(group: FormGroup, questions: QuestionBase<string>[]): Observable<FormGroup> {
        return this.formQuestions(questions).pipe(
            map(processedQuestions => {
                const newControls = this.toFormGroup(processedQuestions);
                Object.keys(newControls.controls).forEach(fullKey => {
                    const control = newControls.get(fullKey);
                    if (!control) return;
                    // Normalize: inside a category group we only want the leaf key
                    const leafKey = fullKey.includes('.') ? fullKey.split('.').pop()! : fullKey;
                    // Avoid overwriting existing different control accidentally
                    if (!group.get(leafKey)) {
                        group.addControl(leafKey, control);
                    }
                });
                return group;
            })
        );
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

    createForm(formName: string, questions: any[]): Observable<FormGroup> {
        const formGroup = this.setFormGroup(formName);
        const nestedGroup = formGroup.get(formName) as FormGroup;

        return this.addQuestionToGroup(nestedGroup, questions).pipe(
            map(() => formGroup)
        );
    }
}


