import { FormGroup } from "@angular/forms";
import { QuestionBase } from "../../question-base";

export class FormGroupBase<T>{
    key: string;
    title: string;
    fields: (QuestionBase<T>[] | FormGroupBase<T>[]);
    isCategory?: boolean;
    isArray?: boolean;
    expandable?: boolean;
    min_instances?: number;
    max_instances?: number;
    current_instances?: number;

    constructor( options: {
        key?: string;
        title?: string;
        fields?: (QuestionBase<T>[]| FormGroupBase<T>[]);
        isCategory?: boolean;
        isArray?: boolean;
        expandable?: boolean;
        min_instances?: number;
        max_instances?: number;
        current_instances?: number;
    } = {})

    {
        this.key = options.key || "";
        this.title = options.title || "";
        this.fields = options.fields || [];
        this.isCategory = options.isCategory || false;
        this.isArray = options.isArray || false;
        this.expandable = options.expandable || false; 
        this.min_instances = options.min_instances || 0;
        this.max_instances = options.max_instances || 1;
        this.current_instances = options.current_instances || 0;
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
        (obj.isArray === undefined || typeof obj.isArray === 'boolean') &&
        (obj.expandable === undefined || typeof obj.expandable === 'boolean') &&
        (obj.min_instances === undefined || typeof obj.min_instances === 'number') &&
        (obj.max_instances === undefined || typeof obj.max_instances === 'number') &&
        (obj.current_instances === undefined || typeof obj.current_instances === 'number')
      );
}