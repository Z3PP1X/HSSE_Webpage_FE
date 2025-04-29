import { QuestionBase } from "../question-base";


export class ContactDataQuestion extends QuestionBase<string> {
  override field_type = 'contactdata';
  
}