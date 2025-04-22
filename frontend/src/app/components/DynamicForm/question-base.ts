import { FormGroup } from "@angular/forms";

export interface AjaxConfig {
  endpoint: string;
  method?: 'GET' | 'POST';
  triggerEvents?: ('init' | 'change' | 'blur')[];
  paramMap?: Record<string, string>;
  debounceTime?: number;
  targetKey?: string;
  onSuccess?: (context: {
    response: any;
    form: FormGroup;
    question: QuestionBase<any>;
    value: any;
  }) => void;
  onError?: (error: any) => void;
}


export class QuestionBase<T>{
  value: T | undefined;
  key: string;
  label: string;
  helpText: string; 
  required: boolean;
  order: number;
  type: string;
  fetchOptions: boolean;
  options: {key: string, value: number}[];
  category?: string; 

  constructor(
    options: {
      value?: T;
      key?: string;
      label?: string;
      helptText?: string; 
      required?: boolean;
      order?: number;
      type?: string;
      fetchOptions?: boolean;
      options?: {key: string; value: number}[];
      category?: string;
    } = {}
    
  ){
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.helpText = options.helptText || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.type = options.type || '';
    this.fetchOptions = options.fetchOptions || false;
    this.options = options.options || [];
    this.category = options.category;
  }
}
