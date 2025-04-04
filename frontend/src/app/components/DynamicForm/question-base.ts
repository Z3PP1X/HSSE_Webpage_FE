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
  title: string;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  type: string;
  fetchOptions: boolean;
  apiEndpoint: string;
  options: {key: string, value: number}[];
  ajaxConfig?: AjaxConfig;
  category?: string; // Added missing property

  constructor(
    options: {
      value?: T;
      title?: string;
      key?: string;
      label?: string;
      required?: boolean;
      order?: number;
      controlType?: string;
      type?: string;
      fetchOptions?: boolean;
      apiEndpoint?: string;
      options?: {key: string; value: number}[];
      ajaxConfig?: AjaxConfig;
      category?: string; // Added to constructor options
    } = {}
  ){
    this.value = options.value;
    this.title = options.title || '';
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.fetchOptions = options.fetchOptions || false;
    this.apiEndpoint = options.apiEndpoint || '';
    this.options = options.options || [];
    this.ajaxConfig = options.ajaxConfig;
    this.category = options.category; // Initialize the category property
  }
}
