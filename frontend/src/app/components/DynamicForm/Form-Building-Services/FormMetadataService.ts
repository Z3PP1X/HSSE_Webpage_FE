import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
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
     */
    getFormMetadata(url: string): Observable<QuestionBase<QuestionMetadata>[]> {
        return this.fetchMetadata(url).pipe(
            map((resData) => this.convertMetadataToQuestionModel(resData))
        );
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

