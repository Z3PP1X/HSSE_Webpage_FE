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

    for (let index = 0; index < data.length; index++) {

      const element = data[index];

      switch (element.controlType) {
        case "textbox":
           const textboxquestion = new TextboxQuestion({
            key: element.key,
            label: element.label,
            type: element.type,
            order: element.order
          })
          questions.push(textboxquestion);
          break;
        case "location":
          const locationquestion = new LocationQuestion({
            key: element.key,
            label: element.label,
            type: element.type,
            order: element.order
          })
          questions.push(locationquestion)
          break;
        case "datetime":
          const datetimequestion = new DateTimeQuestion({
            key: element.key,
            label: element.label,
            type: element.type,
            order: element.order
          })
          questions.push(datetimequestion)
          break;
        case "dropdown":
          const dropdownquestion = new DropdownQuestion({
            key: element.key,
            label: element.label,
            type: element.type,
            options: element.options
          })
          questions.push(dropdownquestion)
          break;
      }

    };
    return of(questions.sort((a, b) => a.order - b.order));
  }
}
