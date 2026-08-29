import type { OpenAPIV3 } from "openapi-types";
import type { CodeXaRequestBody } from "../models/codexa-endpoint.js";
export declare class RequestBodyMapper {
    map(requestBody: OpenAPIV3.RequestBodyObject | undefined): CodeXaRequestBody | undefined;
    private mapSchema;
    private extractReferenceName;
}
//# sourceMappingURL=request-body.mapper.d.ts.map