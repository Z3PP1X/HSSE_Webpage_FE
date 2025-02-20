import { Component, Input, OnInit, input } from '@angular/core';
import { QuestionBase } from '../../question-base';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionControlService } from '../../services/question-control.service';
import { FormQuestionComponent } from '../../Form-Question/form-question/form-question.component';

@Component({
  selector: 'app-form',
  standalone: true,
  providers:[QuestionControlService, FormQuestionComponent],
  imports: [ReactiveFormsModule, FormQuestionComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit{

  formTitle = input.required<string>();
  @Input() questions: QuestionBase<string>[] | null = [];
  form!: FormGroup;
  payLoad = '';

  constructor(private qcs: QuestionControlService) {}

  ngOnInit(): void {
      this.form = this.qcs.toFormGroup(this.questions as QuestionBase<string>[])

      console.log("Here should be questions")
      console.log(this.questions)
      console.log("Are there questions???")

      if (this.questions) {

        for (let question = 0; question < this.questions.length; question++) {
          const element = this.questions[question];

        }

      }
  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.getRawValue());
  }


}
