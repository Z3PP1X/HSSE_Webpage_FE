import { Injectable } from "@angular/core";

import { DropdownQuestion } from "../questions/dropdown";
import { TextboxQuestion } from "../questions/textbox";
import { DateTimeQuestion } from "../questions/datetime";
import { LocationQuestion } from "../questions/location";

import { of } from "rxjs";

import { QuestionBase } from "../question-base";

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  getQuestions(data: any) {
    const questions: QuestionBase<string>[] = []

    for (const element of data) {
      const baseConfig = {
        key: element.key,
        label: element.label,
        type: element.type,
        required: element.required,
        order: element.order,
        fetchOptions: element.fetchOptions,
        apiEndpoint: element.apiEndpoint,
        ajaxConfig: element.ajaxConfig,   
        value: element.value,             
        controlType: element.controlType, 
        options: element.options          
      };

      switch (element.controlType) {
        case "textbox":
           const textboxquestion = new TextboxQuestion({
            ...baseConfig,  
          })
          questions.push(textboxquestion);
          break;
        case "location":
          const locationquestion = new LocationQuestion({
            ...baseConfig,
          })
          questions.push(locationquestion)
          break;
        case "datetime":
          const datetimequestion = new DateTimeQuestion({
            ...baseConfig,
          })
          questions.push(datetimequestion)
          break;
        case "dropdown":
          const dropdownquestion = new DropdownQuestion({
            ...baseConfig,
            options: element.options || []
          })
          questions.push(dropdownquestion)
          break;
          default:
            console.warn('Unknown controlType: ', element.controlType);
            break;
      }

    };
    return of(questions.sort((a, b) => a.order - b.order));
  }
}
