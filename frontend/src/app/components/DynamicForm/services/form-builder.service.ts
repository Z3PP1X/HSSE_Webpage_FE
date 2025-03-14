import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { QuestionBase } from "../question-base";
import { QuestionControlService } from "./question-control.service";
import { QuestionService } from "./question.service";
import { map } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class FormBuilderService {
  constructor(private qcs: QuestionControlService, private qs: QuestionService) {
  }

  setFormGroup(groupName: string){


    return new FormGroup({ [groupName]: new FormGroup({}) })



  }

  addQuestionToGroup(group: FormGroup, question: QuestionBase<string>[]){
    return this.qs.formQuetions(question).pipe(
      map(data => {
        const newControls = this.qcs.toFormGroup(data);
        Object.keys(newControls).forEach(key => {
          group.addControl(key, newControls.get(key));
        });
        return group;
      })
    )

  }
}
