export class QuestionBase<T>{
  value: T | undefined;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  type: string;
  fetchOptions: boolean;
  apiEndpoint: string;
  options: {key: string, value: number}[];

  constructor(
    options: {
      value?: T;
      key?: string;
      label?: string;
      required?: boolean;
      order?: number;
      controlType?: string;
      type?: string;
      fetchOptions?: boolean;
      apiEndpoint?: string;
      options?: {key: string; value: number}[];
    } = {}
  ){
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.fetchOptions = options.fetchOptions || false;
    this.apiEndpoint = options.apiEndpoint || '';
    this.options = options.options || [];
  }
}
