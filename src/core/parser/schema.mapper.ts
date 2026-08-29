import type { OpenAPIV3 } from "openapi-types";

import type {
    CodeXaModel,
    CodeXaProperty
} from "../models/codexa-model.js";

export class SchemaMapper {
    map(
        name: string,
        schema: OpenAPIV3.SchemaObject
    ): CodeXaModel {
        const properties: CodeXaProperty[] = [];

        for (const [propertyName, propertySchema] of Object.entries(
            schema.properties ?? {}
        )) {
            if (!this.isSchemaObject(propertySchema)) {
                continue;
            }

            properties.push({
                name: propertyName,
                type: this.mapType(propertySchema),
                required: schema.required?.includes(propertyName) ?? false
            });
        }

        return {
            name,
            properties
        };
    }

    private mapType(schema: OpenAPIV3.SchemaObject): string {
        switch (schema.type) {
            case "integer":
            case "number":
                return "number";

            case "string":
                return "string";

            case "boolean":
                return "boolean";

            case "array":
                return "unknown[]";

            case "object":
                return "Record<string, unknown>";

            default:
                return "unknown";
        }
    }

    private isSchemaObject(
        value: unknown
    ): value is OpenAPIV3.SchemaObject {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            !("$ref" in value)
        );
    }
}