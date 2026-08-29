import {
    describe,
    expect,
    it
} from "vitest";

import { SchemaTypeMapper } from "../../../src/core/parser/schema-type.mapper.js";
import { OpenApiRefResolver } from "../../../src/core/parser/openapi-ref-resolver.js";

describe("SchemaTypeMapper", () => {

    const document = {
        components: {
            schemas: {
                UserDto: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer"
                        }
                    }
                },

                AddressDto: {
                    type: "object",
                    properties: {
                        city: {
                            type: "string"
                        }
                    }
                }
            }
        }
    };

    const resolver =
        new OpenApiRefResolver(document);

    const mapper =
        new SchemaTypeMapper(resolver);

    // =========================
    // Primitive
    // =========================

    it("should map string", () => {

        expect(
            mapper.map({
                type: "string"
            })
        ).toEqual({
            kind: "primitive",
            name: "string"
        });

    });

    it("should map integer to number", () => {

        expect(
            mapper.map({
                type: "integer"
            })
        ).toEqual({
            kind: "primitive",
            name: "number"
        });

    });

    it("should map number", () => {

        expect(
            mapper.map({
                type: "number"
            })
        ).toEqual({
            kind: "primitive",
            name: "number"
        });

    });

    it("should map boolean", () => {

        expect(
            mapper.map({
                type: "boolean"
            })
        ).toEqual({
            kind: "primitive",
            name: "boolean"
        });

    });

    // =========================
    // Reference
    // =========================

    it("should map reference", () => {

        expect(
            mapper.map({
                $ref: "#/components/schemas/UserDto"
            })
        ).toEqual({
            kind: "reference",
            name: "UserDto"
        });

    });

    // =========================
    // Array
    // =========================

    it("should map array", () => {

        expect(
            mapper.map({
                type: "array",
                items: {
                    type: "string"
                }
            })
        ).toEqual({
            kind: "array",
            elementType: {
                kind: "primitive",
                name: "string"
            }
        });

    });

    it("should map array of references", () => {

        expect(
            mapper.map({
                type: "array",
                items: {
                    $ref: "#/components/schemas/UserDto"
                }
            })
        ).toEqual({
            kind: "array",
            elementType: {
                kind: "reference",
                name: "UserDto"
            }
        });

    });

    // =========================
    // Object
    // =========================

    it("should map object", () => {

        expect(
            mapper.map({
                type: "object",
                required: ["id"],
                properties: {
                    id: {
                        type: "integer"
                    },
                    name: {
                        type: "string"
                    }
                }
            })
        ).toEqual({
            kind: "object",
            properties: [
                {
                    name: "id",
                    type: {
                        kind: "primitive",
                        name: "number"
                    },
                    required: true
                },
                {
                    name: "name",
                    type: {
                        kind: "primitive",
                        name: "string"
                    },
                    required: false
                }
            ]
        });

    });

    // =========================
    // Enum
    // =========================

    it("should map enum", () => {

        expect(
            mapper.map({
                type: "string",
                enum: [
                    "active",
                    "inactive"
                ]
            })
        ).toEqual({
            kind: "enum",
            values: [
                "active",
                "inactive"
            ]
        });

    });

    // =========================
    // oneOf
    // =========================

    it("should map oneOf", () => {

        expect(
            mapper.map({
                oneOf: [
                    {
                        $ref: "#/components/schemas/UserDto"
                    },
                    {
                        $ref: "#/components/schemas/AddressDto"
                    }
                ]
            })
        ).toEqual({
            kind: "oneOf",
            types: [
                {
                    kind: "reference",
                    name: "UserDto"
                },
                {
                    kind: "reference",
                    name: "AddressDto"
                }
            ]
        });

    });

    // =========================
    // anyOf
    // =========================

    it("should map anyOf", () => {

        expect(
            mapper.map({
                anyOf: [
                    {
                        type: "string"
                    },
                    {
                        type: "number"
                    }
                ]
            })
        ).toEqual({
            kind: "anyOf",
            types: [
                {
                    kind: "primitive",
                    name: "string"
                },
                {
                    kind: "primitive",
                    name: "number"
                }
            ]
        });

    });

    // =========================
    // allOf
    // =========================

    it("should map allOf", () => {

        expect(
            mapper.map({
                allOf: [
                    {
                        $ref: "#/components/schemas/UserDto"
                    },
                    {
                        $ref: "#/components/schemas/AddressDto"
                    }
                ]
            })
        ).toEqual({
            kind: "allOf",
            types: [
                {
                    kind: "reference",
                    name: "UserDto"
                },
                {
                    kind: "reference",
                    name: "AddressDto"
                }
            ]
        });

    });

    // =========================
    // Dictionary
    // =========================

    it("should map dictionary", () => {

        expect(
            mapper.map({
                type: "object",
                additionalProperties: {
                    type: "string"
                }
            })
        ).toEqual({
            kind: "dictionary",
            valueType: {
                kind: "primitive",
                name: "string"
            }
        });

    });

});