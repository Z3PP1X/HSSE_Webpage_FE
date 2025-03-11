import { FormGroup } from "@angular/forms";
import { QuestionBase } from "../../question-base";

export class FormGroupBase<T>{
    key: string;
    title: string; 
    fields: (QuestionBase<T> | FormGroupBase<T>)[];
    category: string; 
    isArray?: boolean;
    formClass: "group";

    constructor( options: {
        key?: string;
        title?: string; 
        fields?: (QuestionBase<T> | FormGroupBase<T>)[];
        category?: string;
        isArray?: boolean;
    } = {})

    {
        this.key = options.key || "";
        this.title = options.title || "";
        this.fields = options.fields || [];
        this.category = options.category || "";
        this.isArray = options.isArray || false;
        this.formClass = "group";
    }
};