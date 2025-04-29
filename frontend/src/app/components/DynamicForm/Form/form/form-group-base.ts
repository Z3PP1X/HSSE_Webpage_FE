import { FormGroup } from "@angular/forms";
import { QuestionBase } from "../../question-base";

export class FormGroupBase<T>{
    key: string;
    title: string;
    fields: (QuestionBase<T>[] | FormGroupBase<T>[]);
    isCategory?: boolean;
    isArray?: boolean;

    constructor( options: {
        key?: string;
        title?: string;
        fields?: (QuestionBase<T>[]| FormGroupBase<T>[]);
        isCategory?: boolean;
        isArray?: boolean;
    } = {})

    {
        this.key = options.key || "";
        this.title = options.title || "";
        this.fields = options.fields || [];
        this.isCategory = options.isCategory || false;
        this.isArray = options.isArray || false;
    }
};


export function isFormGroupBase(obj: any): obj is FormGroupBase<any> {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        typeof obj.key === 'string' &&
        typeof obj.title === 'string' &&
        Array.isArray(obj.fields) &&
        (obj.isCategory === undefined || typeof obj.isCategory === 'boolean') &&
        (obj.isArray === undefined || typeof obj.isArray === 'boolean')
      );
}