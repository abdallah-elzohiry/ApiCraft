import type { CodeGenerator } from "../../core/generator/code-generator.js";
import type { CodeXaDocument } from "../../core/models/codexa-document.js";
export declare class TypeScriptGenerator implements CodeGenerator {
    generate(document: CodeXaDocument, outputDirectory: string): Promise<void>;
    private generateModel;
    private generateIndex;
    private toFileName;
}
//# sourceMappingURL=typescript.generator.d.ts.map