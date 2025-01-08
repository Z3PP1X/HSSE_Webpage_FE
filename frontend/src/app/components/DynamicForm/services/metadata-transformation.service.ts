import { Injectable } from "@angular/core";
import { QuestionBase } from "../question-base";
import { QuestionMetadata } from "../interfaces/question-metadata.interface";

@Injectable({
  providedIn: "root"
})
export class MetadataTransformationService{

  convertMetadatatoQuestionModel(fetchedMetadata: Record<string, any>): QuestionBase<QuestionMetadata>[] {
    const transformedMetada: QuestionBase<QuestionMetadata>[] = [];

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
      data.order = 0; // Adjust as needed, since no order property exists in the object
      data.options = element.choices || [];
      data.required = !element.blank;

      transformedMetada.push(data);
    });
    return transformedMetada;
  }
}
