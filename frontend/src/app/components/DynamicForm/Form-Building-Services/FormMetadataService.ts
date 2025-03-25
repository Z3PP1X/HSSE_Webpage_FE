import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, map } from "rxjs";
import { QuestionBase } from "../question-base";
import { QuestionMetadata } from "../interfaces/question-metadata.interface";
import { APIMetadata } from "../interfaces/api-metadata.interface";

@Injectable({
    providedIn: 'root'
})
export class FormMetadataService {
    private readonly http = inject(HttpClient);
    
    constructor() {}

    /**
     * Fetches metadata from the specified API endpoint
     */
    private fetchMetadata(url: string): Observable<APIMetadata[]> {
        return this.http.get<APIMetadata[]>(url);
    }

    /**
     * Gets and transforms metadata into question models
     * Accepts either a URL string or a config object
     */
    getFormMetadata(source: string | any[]): Observable<QuestionBase<QuestionMetadata>[]> {
        // If source is a string, treat it as URL and fetch from API
        if (typeof source === 'string') {
            return this.fetchMetadata(source).pipe(
                map(resData => this.convertMetadataToQuestionModel(resData))
            );
        } 
        // Otherwise, treat it as a local config object
        else {
            return of(this.convertMetadataToQuestionModel(source));
        }
    }

    /**
     * Find form metadata from a module configuration
     * Extracts field metadata from a config structure like SafetyModuleConfig
     */
    getFormMetadataFromConfig(config: any[], formId: string): Observable<QuestionBase<QuestionMetadata>[]> {
        // Search through the config to find the form metadata by ID or other identifier
        let formMetadata: any[] = [];
        
        // Example implementation - adjust based on your config structure
        for (const module of config) {
            if (module.id?.toString() === formId || module.title === formId) {
                formMetadata = module.formMetadata || [];
                break;
            }
            
            // Check items if no match at top level
            if (module.items) {
                for (const item of module.items) {
                    if (item.id?.toString() === formId || item.title === formId) {
                        formMetadata = item.formMetadata || [];
                        break;
                    }
                }
            }
        }
        
        return of(this.convertMetadataToQuestionModel(formMetadata));
    }

    /**
     * Transforms API metadata into question model objects
     */
    convertMetadataToQuestionModel(fetchedMetadata: Record<string, any>): QuestionBase<QuestionMetadata>[] {
        const transformedMetadata: QuestionBase<QuestionMetadata>[] = [];

        Object.values(fetchedMetadata).forEach((element: any) => {
            const data = {} as QuestionBase<QuestionMetadata>;

            switch (element.field_type) {
                case 'ForeignKey':
                    data.controlType = 'customField';
                    break;
                case 'DateTimeField':
                    data.controlType = 'datetime';
                    break;
                case 'IntegerField':
                    data.controlType = element.choices && element.choices.length > 0 ? 'dropdown' : 'integer';
                    break;
                case 'JSONField':
                    data.controlType = 'customField';
                    break;
                case 'BooleanField':
                    data.controlType = 'booleanField';
                    break;
                default:
                    data.controlType = 'textbox';
            }

            data.key = element.key;
            data.label = element.verbose_name;
            data.order = 0;
            data.options = element.choices || [];
            data.required = !element.blank;

            transformedMetadata.push(data);
        });
        
        return transformedMetadata;
    }
}