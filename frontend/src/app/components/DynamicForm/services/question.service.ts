import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { QuestionBase } from "../question-base";
import { DropdownQuestion } from "../questions/dropdown";
import { TextboxQuestion } from "../questions/textbox";
import { DateTimeQuestion } from "../questions/datetime";
import { LocationQuestion } from "../questions/location";
import { ContactDataQuestion } from "../questions/contact-data";
import { AdressFieldQuestion } from "../questions/adressfield";

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  getQuestions(data: any) {
    const questions: QuestionBase<any>[] = [];

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
        options: element.options,
        maxContacts: element.maxContacts,
        category: element.category
      };

      switch (element.controlType) {
        case "textbox":
          questions.push(new TextboxQuestion({ ...baseConfig }));
          break;
        case "contactdata":
          questions.push(new ContactDataQuestion({ ...baseConfig,}));
          break;
          case "adressdata":
          questions.push(new AdressFieldQuestion({ ...baseConfig,}));
          break;
        case "location":
          questions.push(new LocationQuestion({ ...baseConfig }));
          break;
        case "datetime":
          questions.push(new DateTimeQuestion({ ...baseConfig }));
          break;
        case "dropdown":
          questions.push(new DropdownQuestion({ ...baseConfig, options: element.options || [] }));
          break;
        default:
          console.warn('Unknown controlType: ', element.controlType);
          break;
      }
    }

    return of(questions.sort((a, b) => a.order - b.order));
  }
}