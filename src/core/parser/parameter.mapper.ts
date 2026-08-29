import type { OpenAPIV3 } from "openapi-types";

import type { CodeXaParameter } from "../models/codexa-endpoint.js";

export class ParameterMapper {
    map(
        parameter: OpenAPIV3.ParameterObject
    ): CodeXaParameter {
        return {
            name: parameter.name,
            location: this.mapLocation(parameter.in),
            required: parameter.required ?? false,
            type: this.mapType(parameter.schema)
        };
    }

    private mapLocation(
        location: OpenAPIV3.ParameterObject["in"]
    ): CodeXaParameter["location"] {
        switch (location) {
            case "path":
            case "query":
            case "header":
                return location;

            default:
                throw new Error(
                    `Unsupported parameter location: ${location}`
                );
        }
    }

    private mapType(
        schema:
            | OpenAPIV3.ReferenceObject
            | OpenAPIV3.SchemaObject
            | undefined
    ): string {
        if (!schema || "$ref" in schema) {
            return "unknown";
        }

        switch (schema.type) {
            case "integer":
            case "number":
                return "number";

            case "string":
                return "string";

            case "boolean":
                return "boolean";

            default:
                return "unknown";
        }
    }
}