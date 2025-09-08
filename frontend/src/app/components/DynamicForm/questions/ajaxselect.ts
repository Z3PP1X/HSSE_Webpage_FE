import { QuestionBase } from "../question-base";

export class AjaxSelectQuestion extends QuestionBase<string> {
  override field_type = 'ajax_select';
  
  // Additional properties specific to ajax select
  ajax_config?: string;
  search_field?: string;
  display_field?: string;
  value_field?: string;
  endpoint?: string;
  method?: string;
  triggerEvents?: string[];
  debounceTime?: number;
  
  constructor(options: any = {}) {
    super(options);
    this.ajax_config = options.ajax_config || '';
    this.search_field = options.search_field || '';
    this.display_field = options.display_field || '';
    this.value_field = options.value_field || '';
    this.endpoint = options.endpoint || '';
    this.method = options.method || 'GET';
    this.triggerEvents = options.triggerEvents || ['input', 'focus'];
    this.debounceTime = options.debounceTime || 300;
  }
}