import type { CodeXaDocument } from "../models/codexa-document.js";
export interface CodeGenerator {
    generate(document: CodeXaDocument, outputDirectory: string): Promise<void>;
}
//# sourceMappingURL=code-generator.d.ts.map