import type { OpenAPIV3 } from "openapi-types";

import type { CodeXaRequestBody } from "../models/codexa-endpoint.js";

export class RequestBodyMapper {
    map(
        requestBody: OpenAPIV3.RequestBodyObject | undefined
    ): CodeXaRequestBody | undefined {
        if (!requestBody) {
            return undefined;
        }

        const schema =
            requestBody.content?.["application/json"]?.schema;

        if (!schema) {
            return undefined;
        }

        return {
            required: requestBody.required ?? false,
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