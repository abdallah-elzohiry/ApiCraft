import type { OpenAPIV3 } from "openapi-types";
import type { CodeXaModel } from "../models/codexa-model.js";
export declare class SchemaMapper {
    map(name: string, schema: OpenAPIV3.SchemaObject): CodeXaModel;
    private mapType;
    private isSchemaObject;
}
//# sourceMappingURL=schema.mapper.d.ts.map