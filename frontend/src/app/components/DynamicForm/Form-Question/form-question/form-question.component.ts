import { Component, Input } from '@angular/core';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionBase } from '../../question-base';



@Component({
  selector: 'app-form-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-question.component.html',
  styleUrl: './form-question.component.css'
})
export class FormQuestionComponent {

  @Input() question!: QuestionBase<string>;
  @Input() form!: FormGroup;


  get isValid() {
    return this.form.controls[this.question.key].valid;
  }

}
