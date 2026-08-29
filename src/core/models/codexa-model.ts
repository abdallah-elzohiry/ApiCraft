export interface CodeXaModel {
  name: string;
  properties: CodeXaProperty[];
}

export interface CodeXaProperty {
  name: string;
  type: string;
  required: boolean;
}