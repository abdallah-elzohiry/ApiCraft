import { CodeXaEndpoint } from "./codexa-endpoint.js";
import { CodeXaModel } from "./codexa-model.js";

export interface CodeXaDocument {
  title: string;
  version: string;
  endpoints: CodeXaEndpoint[];
  models: CodeXaModel[];
}