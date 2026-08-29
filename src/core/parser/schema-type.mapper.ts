import type { OpenAPIV3 } from "openapi-types";

import type { RefResolver } from "./ref-resolver.js";
import type { CodeXaType } from "../models/codexa-type.js";

export class SchemaTypeMapper {

    constructor(
        private readonly refResolver: RefResolver
    ) {}

    map(
        schema:
            | OpenAPIV3.SchemaObject
            | OpenAPIV3.ReferenceObject
    ): CodeXaType {

        // =========================
        // $ref
        // =========================

        if ("$ref" in schema) {
            return {
                kind: "reference",
                name: this.extractReferenceName(
                    schema.$ref
                )
            };
        }

        // =========================
        // oneOf
        // =========================

        if (schema.oneOf) {
            return {
                kind: "oneOf",
                types: schema.oneOf.map(
                    (type) => this.map(type)
                )
            };
        }

        // =========================
        // anyOf
        // =========================

        if (schema.anyOf) {
            return {
                kind: "anyOf",
                types: schema.anyOf.map(
                    (type) => this.map(type)
                )
            };
        }

        // =========================
        // allOf
        // =========================

        if (schema.allOf) {
            return {
                kind: "allOf",
                types: schema.allOf.map(
                    (type) => this.map(type)
                )
            };
        }

        // =========================
        // enum
        // =========================

        if (schema.enum) {
            return {
                kind: "enum",
                values: schema.enum.filter(
                    (
                        value
                    ): value is
                        | string
                        | number
                        | boolean =>
                        typeof value === "string" ||
                        typeof value === "number" ||
                        typeof value === "boolean"
                )
            };
        }

        // =========================
        // Array
        // =========================

        if (schema.type === "array") {
            return {
                kind: "array",
                elementType: schema.items
                    ? this.map(schema.items)
                    : {
                        kind: "primitive",
                        name: "unknown"
                    }
            };
        }

        // =========================
        // Object
        // =========================

        if (schema.type === "object") {

            // Dictionary
            if (
                schema.additionalProperties &&
                schema.additionalProperties !== true
            ) {
                return {
                    kind: "dictionary",
                    valueType:
                        this.map(
                            schema.additionalProperties
                        )
                };
            }

            // Regular object
            return {
                kind: "object",
                properties: Object.entries(
                    schema.properties ?? {}
                ).map(
                    ([name, propertySchema]) => ({
                        name,

                        type: this.map(
                            propertySchema
                        ),

                        required:
                            schema.required?.includes(
                                name
                            ) ?? false
                    })
                )
            };
        }

        // =========================
        // Primitive
        // =========================

        switch (schema.type) {

            case "integer":
            case "number":
                return {
                    kind: "primitive",
                    name: "number"
                };

            case "string":
                return {
                    kind: "primitive",
                    name: "string"
                };

            case "boolean":
                return {
                    kind: "primitive",
                    name: "boolean"
                };

            default:
                return {
                    kind: "primitive",
                    name: "unknown"
                };
        }
    }

    private extractReferenceName(
        reference: string
    ): string {
        return (
            reference.split("/").pop() ??
            "unknown"
        );
    }
}