import {
    describe,
    expect,
    it
} from "vitest";

import { TypeScriptTypeRenderer } from "../../../src/generators/typescript/typescript-type.renderer.js";

describe("TypeScriptTypeRenderer", () => {

    const renderer =
        new TypeScriptTypeRenderer();

    // =========================
    // Primitive
    // =========================

    it("should render primitive", () => {

        expect(
            renderer.render({
                kind: "primitive",
                name: "string"
            })
        ).toBe("string");

    });

    // =========================
    // Reference
    // =========================

    it("should render reference", () => {

        expect(
            renderer.render({
                kind: "reference",
                name: "UserDto"
            })
        ).toBe("UserDto");

    });

    // =========================
    // Array
    // =========================

    it("should render array", () => {

        expect(
            renderer.render({
                kind: "array",
                elementType: {
                    kind: "reference",
                    name: "UserDto"
                }
            })
        ).toBe("UserDto[]");

    });

    // =========================
    // Object
    // =========================

    it("should render object", () => {

        expect(
            renderer.render({
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
            })
        ).toBe(
            `{
  id: number;
  name?: string;
}`
        );

    });

    // =========================
    // Dictionary
    // =========================

    it("should render dictionary", () => {

        expect(
            renderer.render({
                kind: "dictionary",
                valueType: {
                    kind: "primitive",
                    name: "string"
                }
            })
        ).toBe(
            "Record<string, string>"
        );

    });

    // =========================
    // Enum
    // =========================

    it("should render enum", () => {

        expect(
            renderer.render({
                kind: "enum",
                values: [
                    "active",
                    "inactive"
                ]
            })
        ).toBe(
            `"active" | "inactive"`
        );

    });

    // =========================
    // oneOf
    // =========================

    it("should render oneOf", () => {

        expect(
            renderer.render({
                kind: "oneOf",
                types: [
                    {
                        kind: "reference",
                        name: "UserDto"
                    },
                    {
                        kind: "reference",
                        name: "AdminDto"
                    }
                ]
            })
        ).toBe(
            "UserDto | AdminDto"
        );

    });

    // =========================
    // anyOf
    // =========================

    it("should render anyOf", () => {

        expect(
            renderer.render({
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
            })
        ).toBe(
            "string | number"
        );

    });

    // =========================
    // allOf
    // =========================

    it("should render allOf", () => {

        expect(
            renderer.render({
                kind: "allOf",
                types: [
                    {
                        kind: "reference",
                        name: "UserDto"
                    },
                    {
                        kind: "reference",
                        name: "AuditableDto"
                    }
                ]
            })
        ).toBe(
            "UserDto & AuditableDto"
        );

    });

    // =========================
    // Nested types
    // =========================

    it("should render nested types", () => {

        expect(
            renderer.render({
                kind: "array",
                elementType: {
                    kind: "oneOf",
                    types: [
                        {
                            kind: "reference",
                            name: "UserDto"
                        },
                        {
                            kind: "reference",
                            name: "AdminDto"
                        }
                    ]
                }
            })
        ).toBe(
            "(UserDto | AdminDto)[]"
        );

    });

    // =========================
    // References
    // =========================

    it("should collect references", () => {

        expect(
            renderer.getReferences({
                kind: "oneOf",
                types: [
                    {
                        kind: "reference",
                        name: "UserDto"
                    },
                    {
                        kind: "reference",
                        name: "AdminDto"
                    }
                ]
            })
        ).toEqual([
            "UserDto",
            "AdminDto"
        ]);

    });

    // =========================
    // Nested references
    // =========================

    it("should collect nested references", () => {

        expect(
            renderer.getReferences({
                kind: "object",
                properties: [
                    {
                        name: "users",
                        type: {
                            kind: "array",
                            elementType: {
                                kind: "reference",
                                name: "UserDto"
                            }
                        },
                        required: false
                    },
                    {
                        name: "role",
                        type: {
                            kind: "reference",
                            name: "RoleDto"
                        },
                        required: false
                    }
                ]
            })
        ).toEqual([
            "UserDto",
            "RoleDto"
        ]);

    });

});