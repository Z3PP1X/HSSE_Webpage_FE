import { QuestionBase } from "../question-base";

export class DateTimeQuestion extends QuestionBase<string>{
  override controlType = 'datetime';
}
