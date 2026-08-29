import type { CodeXaDocument } from "../../core/models/codexa-document.js";
export declare class TypeScriptClientGenerator {
    generate(document: CodeXaDocument, outputDirectory: string): Promise<void>;
    private generateClient;
    private generateImports;
    private generateMethod;
    private generateUrl;
    private generateMethodName;
    private groupByResource;
    private toPascalCase;
    private toFileName;
    private indent;
    private getBaseType;
    private toParameterName;
}
//# sourceMappingURL=client.generator.d.ts.map