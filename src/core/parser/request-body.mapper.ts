import type { OpenAPIV3 } from "openapi-types";

import type { CodeXaRequestBody } from "../models/codexa-endpoint.js";
import { SchemaTypeMapper } from "./schema-type.mapper.js";

export class RequestBodyMapper {

    constructor(
        private readonly schemaTypeMapper: SchemaTypeMapper
    ) {}

    map(
        requestBody: OpenAPIV3.RequestBodyObject
    ): CodeXaRequestBody {

        const schema =
            requestBody.content?.[
                "application/json"
            ]?.schema;

        if (!schema) {
            return {
                type: {
                    kind: "primitive",
                    name: "unknown"
                },
                required:
                    requestBody.required ?? false
            };
        }

        return {
            type: this.schemaTypeMapper.map(schema),
            required:
                requestBody.required ?? false
        };
    }
}