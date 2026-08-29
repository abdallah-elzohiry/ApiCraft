import type { OpenAPIV3 } from "openapi-types";
import type { CodeXaResponse } from "../models/codexa-endpoint.js";
export declare class ResponseMapper {
    map(responses: OpenAPIV3.ResponsesObject): CodeXaResponse | undefined;
    private mapSchema;
    private extractReferenceName;
}
//# sourceMappingURL=response.mapper.d.ts.map