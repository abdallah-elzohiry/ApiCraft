import type { OpenAPIV3 } from "openapi-types";

import type { CodeXaResponse } from "../models/codexa-endpoint.js";

import { SchemaTypeMapper } from "./schema-type.mapper.js";

export class ResponseMapper {

    constructor(
        private readonly schemaTypeMapper: SchemaTypeMapper
    ) {}

    map(
        responses: OpenAPIV3.ResponsesObject
    ): CodeXaResponse | undefined {

        const successResponse =
            Object.entries(responses).find(
                ([statusCode]) => {
                    const status = Number(statusCode);

                    return status >= 200 && status < 300;
                }
            );

        if (!successResponse) {
            return undefined;
        }

        const [statusCode, response] =
            successResponse;

        if ("$ref" in response) {
            return undefined;
        }

        const schema =
            response.content?.[
                "application/json"
            ]?.schema;

        if (!schema) {
            return {
                statusCode: Number(statusCode),

                type: {
                    kind: "primitive",
                    name: "unknown"
                }
            };
        }

        return {
            statusCode: Number(statusCode),

            type: this.schemaTypeMapper.map(
                schema
            )
        };
    }
}