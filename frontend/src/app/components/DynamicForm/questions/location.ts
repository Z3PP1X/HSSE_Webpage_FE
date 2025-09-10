import { QuestionBase } from "../question-base";

export class LocationQuestion extends QuestionBase<string>{
  override field_type ='location';
}
