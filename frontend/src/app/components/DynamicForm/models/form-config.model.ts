export interface Choice {
    value: string | number;
    label: string;
}

export interface AjaxConfig {
    endpoint: string;
    method: 'GET' | 'POST';
    triggerEvents: string[];
    debounceTime: number;
    /** 
     * How to pass the search term to the endpoint.
     * - 'query' (default): Append as query parameter (e.g., ?search=term)
     * - 'path': Append to URL path (e.g., /endpoint/term/)
     */
    param_type?: 'path' | 'query';
}

export interface AjaxConfigs {
    [key: string]: AjaxConfig;
}

export type FieldType = 'text' | 'number' | 'email' | 'ajax_select' | 'select' | 'date' | 'checkbox';

export interface FieldConfig {
    key: string;
    original_key: string;
    instance_key: string;
    label: string;
    help_text: string;
    required: boolean;
    field_type: FieldType;
    choices: Choice[] | null;
    model: string;
    /** Group identifier for rendering related fields together on the same line */
    group?: string;
    // Specific to AJAX fields
    ajax_config?: string;
    search_field?: string;
    display_field?: string;
    value_field?: string;
    // Specific to expandable fields
    key_template?: string;
    expandable?: boolean;
}

export interface FormCategory {
    key: string;
    title: string;
    isCategory: boolean; // true
    expandable: boolean;
    fields?: FieldConfig[]; // If not expandable or mixed
    min_instances?: number;
    max_instances?: number;
    structure?: FormCategory[]; // Recursive structure support if needed, though provided JSON is flat-ish
}

export interface FormConfig {
    form_id: string;
    form_title: string;
    shared_configs: {
        ajax_configs: AjaxConfigs;
    };
    structure: FormCategory[];
}
