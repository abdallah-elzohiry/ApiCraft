import type { CodeXaDocument } from "../models/codexa-document.js";
import { TypeScriptClientGenerator } from "../../generators/typescript/client.generator.js";
import { generateHttpClient } from "../../generators/typescript/http-client.generator.js";
export interface CodeGenerator {
  generate(
    
    document: CodeXaDocument,
    outputDirectory: string
  ): Promise<void>;
}