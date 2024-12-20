import { Choices } from "./choices.interface";

export interface QuestionMetadata {
  key: string;
  label: string;
  vaule: string;
  required: boolean;
  controlType: string;
  type: string;
  order: number;
  options: Choices[];
}
