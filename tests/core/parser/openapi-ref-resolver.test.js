import { describe, expect, it } from "vitest";
import { OpenApiRefResolver } from "../../../src/core/parser/openapi-ref-resolver.js";
describe("OpenApiRefResolver", () => {
    it("should resolve local reference", () => {
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
                    }
                }
            }
        };
        const resolver = new OpenApiRefResolver(document);
        const result = resolver.resolve("#/components/schemas/UserDto");
        expect(result).toEqual(document.components.schemas.UserDto);
    });
    it("should resolve nested reference", () => {
        const document = {
            components: {
                schemas: {
                    UserDto: {
                        properties: {
                            address: {
                                $ref: "#/components/schemas/AddressDto"
                            }
                        }
                    },
                    AddressDto: {
                        type: "object"
                    }
                }
            }
        };
        const resolver = new OpenApiRefResolver(document);
        const result = resolver.resolve("#/components/schemas/UserDto");
        expect(result).toEqual(document.components.schemas.UserDto);
    });
    it("should throw when reference does not exist", () => {
        const resolver = new OpenApiRefResolver({});
        expect(() => resolver.resolve("#/components/schemas/UserDto")).toThrow("Unable to resolve reference");
    });
});
//# sourceMappingURL=openapi-ref-resolver.test.js.map