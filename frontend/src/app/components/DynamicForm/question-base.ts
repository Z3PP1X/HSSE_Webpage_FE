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
  field_type: string;
  fetchOptions: boolean;
  options: {label: string, value: number}[] = [];
  category?: string; 
  key_template?: string; 
  expandable?: boolean;
  instance_key?: string; 
  original_key?: string;

  constructor(
    options: {
      value?: T;
      key?: string;
      label?: string;
      helptText?: string; 
      required?: boolean;
      order?: number;
      field_type?: string;
      fetchOptions?: boolean;
      choices?: {key?: any; value?: any; label?: any}[];
      category?: string;
      key_template?: string;
      expandable?: boolean;
      instance_key?: string;
      original_key?: string;
    } = {}
    
  ){
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.helpText = options.helptText || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.field_type = options.field_type || '';
    this.fetchOptions = options.fetchOptions || false;
    const rawChoices = (options as any).choices || [];
    this.options = Array.isArray(rawChoices)
      ? rawChoices.map((c: any) => ({
          label: c.label ?? c.key ?? String(c.value),
          value: c.value ?? c.key
        }))
      : [];
    this.category = options.category;
    this.key_template = options.key_template || '';
    this.expandable = options.expandable || false;
    this.instance_key = options.instance_key || '';
    this.original_key = options.original_key || '';
  }
}

export function isQuestionBase(obj: any): obj is QuestionBase<any> {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.key === 'string' &&
    (!('label' in obj) || typeof obj.label === 'string') &&
    (!('helpText' in obj) || typeof obj.helpText === 'string') &&
    typeof obj.required === 'boolean' &&
    (!('order' in obj) || typeof obj.order === 'number') &&
    (!('field_type' in obj) || typeof obj.field_type === 'string') &&
    (!('fetchOptions' in obj) || typeof obj.fetchOptions === 'boolean') &&
    (!('choices' in obj) || Array.isArray(obj.choices) || obj.choices === null) &&
    (!('category' in obj) || typeof obj.category === 'string' || obj.category === undefined) &&
    // Make these optional checks
    (!('key_template' in obj) || typeof obj.key_template === 'string' || obj.key_template === undefined) &&
    (!('expandable' in obj) || typeof obj.expandable === 'boolean' || obj.expandable === undefined) &&
    (!('instance_key' in obj) || typeof obj.instance_key === 'string' || obj.instance_key === undefined) &&
    (!('original_key' in obj) || typeof obj.original_key === 'string' || obj.original_key === undefined)
  );
}

