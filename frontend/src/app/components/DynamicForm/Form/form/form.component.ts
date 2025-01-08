import { Component, Input, OnInit, input } from '@angular/core';
import { QuestionBase } from '../../question-base';
import { FormGroup } from '@angular/forms';
import { QuestionControlService } from '../../services/question-control.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [],
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
  }


}
