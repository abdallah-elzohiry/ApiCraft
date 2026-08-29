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

        // =========================
        // Find successful response
        // =========================

        const successResponse =
            Object.entries(responses).find(
                ([statusCode]) => {

                    const status =
                        Number(statusCode);

                    return (
                        status >= 200 &&
                        status < 300
                    );
                }
            );

        if (!successResponse) {
            return undefined;
        }

        const [
            statusCode,
            response
        ] = successResponse;

        // =========================
        // Reference Response
        // =========================

        if ("$ref" in response) {
            return undefined;
        }

        const numericStatusCode =
            Number(statusCode);

        // =========================
        // No Content
        // =========================

        if (numericStatusCode === 204) {
            return {
                statusCode: numericStatusCode,

                type: {
                    kind: "void"
                }
            };
        }

        // =========================
        // JSON Schema
        // =========================

        const schema =
            response.content?.[
                "application/json"
            ]?.schema;

        // =========================
        // No Schema
        // =========================

        if (!schema) {
            return {
                statusCode: numericStatusCode,

                type: {
                    kind: "primitive",
                    name: "unknown"
                }
            };
        }

        // =========================
        // Schema
        // =========================

        return {
            statusCode: numericStatusCode,

            type:
                this.schemaTypeMapper.map(
                    schema
                )
        };
    }
}