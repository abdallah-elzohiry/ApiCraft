import {
    describe,
    expect,
    it
} from "vitest";

import { SchemaMapper } from "../../../src/core/parser/schema.mapper.js";
import { OpenApiRefResolver } from "../../../src/core/parser/openapi-ref-resolver.js";
import { SchemaTypeMapper } from "../../../src/core/parser/schema-type.mapper.js";
describe("SchemaMapper", () => {
    const document = {
        components: {
            schemas: {
                AddressDto: {
                    type: "object",
                    properties: {
                        city: {
                            type: "string"
                        }
                    }
                },

                RoleDto: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string"
                        }
                    }
                }
            }
        }
    };

    const resolver =
        new OpenApiRefResolver(document);

    const schemaTypeMapper =
        new SchemaTypeMapper(resolver);

    const mapper =
        new SchemaMapper(schemaTypeMapper);

    it("should map primitive properties", () => {
        const model = mapper.map(
            "UserDto",
            {
                type: "object",
                required: ["id", "name"],
                properties: {
                    id: {
                        type: "integer"
                    },
                    name: {
                        type: "string"
                    },
                    isActive: {
                        type: "boolean"
                    }
                }
            }
        );

        expect(model).toEqual({
            name: "UserDto",
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
                    required: true
                },
                {
                    name: "isActive",
                    type: {
                        kind: "primitive",
                        name: "boolean"
                    },
                    required: false
                }
            ]
        });
    });

    it("should map a $ref property", () => {
        const model = mapper.map(
            "UserDto",
            {
                type: "object",
                properties: {
                    address: {
                        $ref:
                            "#/components/schemas/AddressDto"
                    }
                }
            }
        );

        expect(model.properties).toContainEqual({
            name: "address",
            type: {
                kind: "reference",
                name: "AddressDto"
            },
            required: false
        });
    });

    it("should map an array of $ref", () => {
        const model = mapper.map(
            "UserDto",
            {
                type: "object",
                properties: {
                    roles: {
                        type: "array",
                        items: {
                            $ref:
                                "#/components/schemas/RoleDto"
                        }
                    }
                }
            }
        );

        expect(model.properties).toContainEqual({
            name: "roles",
            type: {
                kind: "array",
                elementType: {
                    kind: "reference",
                    name: "RoleDto"
                }
            },
            required: false
        });
    });
});