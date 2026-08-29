import type { OpenAPIV3 } from "openapi-types";

import type { CodeXaResponse } from "../models/codexa-endpoint.js";

export class ResponseMapper {
    map(
        responses: OpenAPIV3.ResponsesObject
    ): CodeXaResponse | undefined {
        const successResponse = Object.entries(responses)
            .find(([statusCode]) => {
                const status = Number(statusCode);

                return status >= 200 && status < 300;
            });

        if (!successResponse) {
            return undefined;
        }

        const [statusCode, response] = successResponse;

        if ("$ref" in response) {
            return undefined;
        }

        const schema =
            response.content?.["application/json"]?.schema;

        if (!schema) {
            return {
                statusCode: Number(statusCode),
                type: "void"
            };
        }

        return {
            statusCode: Number(statusCode),
            type: this.mapSchema(schema)
        };
    }

    private mapSchema(
        schema:
            | OpenAPIV3.ReferenceObject
            | OpenAPIV3.SchemaObject
    ): string {
        if ("$ref" in schema) {
            return this.extractReferenceName(schema.$ref);
        }

        if (schema.type === "array") {
            if (!schema.items) {
                return "unknown[]";
            }

            return `${this.mapSchema(schema.items)}[]`;
        }

        switch (schema.type) {
            case "integer":
            case "number":
                return "number";

            case "string":
                return "string";

            case "boolean":
                return "boolean";

            case "object":
                return "Record<string, unknown>";

            default:
                return "unknown";
        }
    }

    private extractReferenceName(
        reference: string
    ): string {
        return reference.split("/").pop() ?? "unknown";
    }
}