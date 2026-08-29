import type { CodeXaDocument } from "../models/codexa-document.js";
export declare class OpenApiParser {
    private readonly schemaMapper;
    private readonly parameterMapper;
    private readonly responseMapper;
    private readonly requestBodyMapper;
    parse(filePath: string): Promise<CodeXaDocument>;
    private isOperation;
    private isSchemaObject;
    private mapParameters;
    private mapRequestBody;
}
//# sourceMappingURL=openapi.parser.d.ts.map