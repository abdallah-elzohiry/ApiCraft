import type {
    OpenAPIV3,
    OpenAPIV3_1
} from "openapi-types";

import type { RefResolver } from "./ref-resolver.js";
import type { CodeXaType } from "../models/codexa-type.js";

type OpenApiSchema =
    | OpenAPIV3.SchemaObject
    | OpenAPIV3_1.SchemaObject;

type OpenApiReference =
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3_1.ReferenceObject;

export class SchemaTypeMapper {

    constructor(
        private readonly refResolver: RefResolver
    ) { }

    map(
        schema: OpenApiSchema | OpenApiReference
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
        // const - OpenAPI 3.1
        // =========================

        if (
            "const" in schema &&
            (
                typeof schema.const === "string" ||
                typeof schema.const === "number" ||
                typeof schema.const === "boolean"
            )
        ) {
            return {
                kind: "enum",
                values: [schema.const]
            };
        }

        // =========================
        // OpenAPI 3.1 type array
        // =========================

        if (Array.isArray(schema.type)) {

            const types =
                schema.type.map(type =>
                    this.mapOpenApi31Type(
                        type,
                        schema
                    )
                );

            if (types.length === 1) {
                return types[0];
            }

            return {
                kind: "anyOf",
                types
            };
        }

        // =========================
        // oneOf
        // =========================

        if (schema.oneOf?.length) {
            return {
                kind: "oneOf",
                types: schema.oneOf.map(
                    type => this.map(type)
                )
            };
        }

        // =========================
        // anyOf
        // =========================

        if (schema.anyOf?.length) {
            return {
                kind: "anyOf",
                types: schema.anyOf.map(
                    type => this.map(type)
                )
            };
        }

        // =========================
        // allOf
        // =========================

        if (schema.allOf?.length) {
            return {
                kind: "allOf",
                types: schema.allOf.map(
                    type => this.map(type)
                )
            };
        }

        // =========================
        // enum
        // =========================

        if (schema.enum?.length) {
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
        // Nullable - OpenAPI 3.0
        // =========================

        if (this.isNullableSchema(schema)) {

            const baseType =
                this.mapNonNullable(schema);

            return {
                kind: "anyOf",
                types: [
                    baseType,
                    {
                        kind: "null"
                    }
                ]
            };
        }

        return this.mapNonNullable(schema);
    }

    private mapOpenApi31Type(
        type: string,
        schema: OpenApiSchema
    ): CodeXaType {

        if (type === "null") {
            return {
                kind: "null"
            };
        }

        return this.mapPrimitiveType(type);
    }

    private mapNonNullable(
        schema: OpenApiSchema
    ): CodeXaType {

        // =========================
        // Array
        // =========================

        if (schema.type === "array") {

            return {
                kind: "array",

                elementType:
                    this.map(
                        schema.items
                    )
            };
        }

        // =========================
        // Object
        // =========================

        if (schema.type === "object") {

            const properties =
                Object.entries(
                    schema.properties ?? {}
                ).map(
                    ([name, propertySchema]) => ({
                        name,

                        type:
                            this.map(
                                propertySchema
                            ),

                        required:
                            schema.required?.includes(
                                name
                            ) ?? false
                    })
                );

            // =========================
            // Dictionary
            // =========================

            if (
                schema.additionalProperties === true
            ) {
                return {
                    kind: "dictionary",

                    valueType: {
                        kind: "primitive",
                        name: "unknown"
                    }
                };
            }

            if (
                schema.additionalProperties &&
                typeof schema.additionalProperties === "object"
            ) {
                return {
                    kind: "dictionary",

                    valueType:
                        this.map(
                            schema.additionalProperties
                        )
                };
            }

            return {
                kind: "object",
                properties
            };
        }

        if (
            typeof schema.type === "string"
        ) {
            return this.mapPrimitiveType(
                schema.type
            );
        }

        return {
            kind: "primitive",
            name: "unknown"
        };
    }

    private mapPrimitiveType(
        type: string | undefined
    ): CodeXaType {

        switch (type) {

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

            case "null":
                return {
                    kind: "null"
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
            reference
                .split("/")
                .pop() ??
            "unknown"
        );
    }

    private isNullableSchema(
        schema: OpenApiSchema
    ): schema is OpenApiSchema & { nullable: true } {

        return (
            "nullable" in schema &&
            schema.nullable === true
        );
    }
}