import { Choices } from "./choices.interface";

export interface APIMetadata {
  key: string,
  config: ConfigurationItem
}

interface ConfigurationItem{
  verbose_name: string,
  field_type: string,
  key: string,
  blank: boolean,
  null: boolean,
  order: number
  options?: Choices[]
}
