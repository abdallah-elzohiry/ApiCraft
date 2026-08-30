import {
    afterEach,
    describe,
    expect,
    it
} from "vitest";

import {
    mkdtemp,
    readFile,
    rm
} from "node:fs/promises";

import os from "node:os";
import path from "node:path";

import { OpenApiParser } from "../../src/core/parser/openapi.parser.js";
import { TypeScriptGenerator } from "../../src/generators/typescript/typescript.generator.js";

describe("Advanced OpenAPI → TypeScript", () => {

    let outputDirectory: string | undefined;

    afterEach(async () => {

        if (outputDirectory) {
            await rm(
                outputDirectory,
                {
                    recursive: true,
                    force: true
                }
            );
        }

    });

    it("should generate advanced TypeScript models and clients", async () => {

        const parser =
            new OpenApiParser();

        const fixturePath =
            path.resolve(
                "tests/fixtures/advanced.openapi.json"
            );

        const document =
            await parser.parse(fixturePath);

        // =========================
        // Document
        // =========================

        expect(document.title)
            .toBe("Advanced Users API");

        // =========================
        // Models
        // =========================

        expect(document.models)
            .toHaveLength(6);

        const modelNames =
            document.models.map(
                model => model.name
            );

        expect(modelNames)
            .toContain("UserDto");

        expect(modelNames)
            .toContain("CreateUserRequest");

        expect(modelNames)
            .toContain("AddressDto");

        expect(modelNames)
            .toContain("RoleDto");

        expect(modelNames)
            .toContain("AdminProfileDto");

        expect(modelNames)
            .toContain("UserProfileDto");

        // =========================
        // Endpoints
        // =========================

        expect(document.endpoints)
            .toHaveLength(3);

        // =========================
        // Generate
        // =========================

        outputDirectory =
            await mkdtemp(
                path.join(
                    os.tmpdir(),
                    "codexa-advanced-"
                )
            );

        const generator =
            new TypeScriptGenerator();

        await generator.generate(
            document,
            outputDirectory
        );

        // =========================
        // UserDto
        // =========================

        const userDto =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "user-dto.ts"
                ),
                "utf8"
            );

        expect(userDto)
            .toContain(
                "id: number;"
            );

        expect(userDto)
            .toContain(
                "name: string;"
            );

        expect(userDto)
            .toContain(
                "email?: string;"
            );

        expect(userDto)
            .toContain(
                "isActive?: boolean;"
            );

        expect(userDto)
            .toContain(
                "address?: AddressDto;"
            );

        expect(userDto)
            .toContain(
                "roles?: RoleDto[];"
            );

        // =========================
        // CreateUserRequest
        // =========================

        const createUserRequest =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "create-user-request.ts"
                ),
                "utf8"
            );

        expect(createUserRequest)
            .toContain(
                "name: string;"
            );

        expect(createUserRequest)
            .toContain(
                "email: string;"
            );

        expect(createUserRequest)
            .toContain(
                "roleIds?: number[];"
            );

        // =========================
        // AddressDto
        // =========================

        const addressDto =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "address-dto.ts"
                ),
                "utf8"
            );

        expect(addressDto)
            .toContain(
                "city?: string;"
            );

        expect(addressDto)
            .toContain(
                "country?: string;"
            );

        // =========================
        // RoleDto
        // =========================

        const roleDto =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "role-dto.ts"
                ),
                "utf8"
            );

        expect(roleDto)
            .toContain(
                "id?: number;"
            );

        expect(roleDto)
            .toContain(
                "name?: string;"
            );

        // =========================
        // Client
        // =========================

        const usersClient =
            await readFile(
                path.join(
                    outputDirectory,
                    "clients",
                    "users.client.ts"
                ),
                "utf8"
            );

        expect(usersClient)
            .toContain(
                "export class UsersClient"
            );

        expect(usersClient)
            .toContain(
                "getUser"
            );

        expect(usersClient)
            .toContain(
                "createUser"
            );

        expect(usersClient)
            .toContain(
                "deactivateUser"
            );

        // =========================
        // Path parameter
        // =========================

        expect(usersClient)
            .toContain(
                "id: number"
            );

        // =========================
        // Query parameter
        // =========================

        expect(usersClient)
            .toContain(
                "includeAddress?: boolean"
            );

        // =========================
        // Request body
        // =========================

        expect(usersClient)
            .toContain(
                "request: CreateUserRequest"
            );

        // =========================
        // Response
        // =========================

        expect(usersClient)
            .toContain(
                "Promise<UserDto>"
            );

        // =========================
        // Void response
        // =========================

        expect(usersClient)
            .toContain(
                "Promise<void>"
            );

    });
    it("should support OpenAPI 3.1 $defs", async () => {

        const parser =
            new OpenApiParser();

        const fixturePath =
            path.resolve(
                "tests/fixtures/openapi-3.1-defs.openapi.json"
            );

        const document =
            await parser.parse(fixturePath);

        // =========================
        // Document
        // =========================

        expect(document.title)
            .toBe("OpenAPI 3.1 $defs API");

        // =========================
        // Models
        // =========================

        expect(document.models)
            .toHaveLength(1);

        const userModel =
            document.models.find(
                model => model.name === "UserDto"
            );

        expect(userModel)
            .toBeDefined();

        // =========================
        // Endpoint
        // =========================

        expect(document.endpoints)
            .toHaveLength(1);

        const endpoint =
            document.endpoints[0];

        expect(endpoint.operationId)
            .toBe("getUser");

        // =========================
        // Generate
        // =========================

        outputDirectory =
            await mkdtemp(
                path.join(
                    os.tmpdir(),
                    "codexa-openapi-31-"
                )
            );

        const generator =
            new TypeScriptGenerator();

        await generator.generate(
            document,
            outputDirectory
        );

        // =========================
        // UserDto
        // =========================

        const userDto =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "user-dto.ts"
                ),
                "utf8"
            );

        expect(userDto)
            .toContain(
                "id: number;"
            );

        expect(userDto)
            .toContain(
                "name: string;"
            );

        expect(userDto)
            .toContain(
                "address?: Address;"
            );

    });
    it("should support comprehensive OpenAPI 3.1 features", async () => {

        const parser =
            new OpenApiParser();

        const fixturePath =
            path.resolve(
                "tests/fixtures/openapi-3.1-comprehensive.openapi.json"
            );

        // console.log("FIXTURE PATH:", fixturePath);

        // const raw =
        //     await readFile(
        //         fixturePath,
        //         "utf8"
        //     );

        // console.log(
        //     "OPENAPI VERSION:",
        //     JSON.parse(raw).openapi
        // );

        const document =
            await parser.parse(fixturePath);

        // =========================
        // Document
        // =========================

        expect(document.title)
            .toBe("Comprehensive OpenAPI 3.1 API");

        expect(document.version)
            .toBe("1.0.0");

        // =========================
        // Models
        // =========================

        expect(document.models)
            .toHaveLength(5);

        const modelNames =
            document.models.map(
                model => model.name
            );
        
        expect(modelNames)
            .toContain("ProductDto");

        expect(modelNames)
            .toContain("CreateProductRequest");

        expect(modelNames)
            .toContain("PhysicalCategory");

        expect(modelNames)
            .toContain("DigitalCategory");

        // =========================
        // Endpoints
        // =========================

        expect(document.endpoints)
            .toHaveLength(3);

        // =========================
        // GET Product
        // =========================

        const getProduct =
            document.endpoints.find(
                endpoint =>
                    endpoint.operationId === "getProduct"
            );

        expect(getProduct)
            .toBeDefined();

        expect(getProduct?.method)
            .toBe("GET");

        expect(getProduct?.path)
            .toBe("/products/{id}");

        // =========================
        // Path Parameter
        // =========================

        const idParameter =
            getProduct?.parameters.find(
                parameter =>
                    parameter.name === "id"
            );

        expect(idParameter)
            .toBeDefined();

        expect(idParameter?.location)
            .toBe("path");

        expect(idParameter?.required)
            .toBe(true);

        // =========================
        // Query Parameter
        // =========================

        const includeDetails =
            getProduct?.parameters.find(
                parameter =>
                    parameter.name === "includeDetails"
            );

        expect(includeDetails)
            .toBeDefined();

        expect(includeDetails?.location)
            .toBe("query");

        expect(includeDetails?.required)
            .toBe(false);

        // =========================
        // Response
        // =========================

        expect(getProduct?.response)
            .toBeDefined();

        expect(getProduct?.response?.statusCode)
            .toBe(200);

        // =========================
        // POST Product
        // =========================

        const createProduct =
            document.endpoints.find(
                endpoint =>
                    endpoint.operationId === "createProduct"
            );

        expect(createProduct)
            .toBeDefined();

        expect(createProduct?.method)
            .toBe("POST");

        expect(createProduct?.requestBody)
            .toBeDefined();

        // =========================
        // DELETE Product
        // =========================

        const deleteProduct =
            document.endpoints.find(
                endpoint =>
                    endpoint.operationId === "deleteProduct"
            );

        expect(deleteProduct)
            .toBeDefined();

        expect(deleteProduct?.method)
            .toBe("DELETE");

        expect(deleteProduct?.response)
            .toBeDefined();

        expect(deleteProduct?.response?.statusCode)
            .toBe(204);

        expect(deleteProduct?.response?.type)
            .toEqual({
                kind: "void"
            });

        // =========================
        // Generate
        // =========================

        outputDirectory =
            await mkdtemp(
                path.join(
                    os.tmpdir(),
                    "codexa-openapi-31-comprehensive-"
                )
            );

        const generator =
            new TypeScriptGenerator();

        await generator.generate(
            document,
            outputDirectory
        );

        // =========================
        // ProductDto
        // =========================

        const productDto =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "product-dto.ts"
                ),
                "utf8"
            );

        expect(productDto)
            .toContain(
                "id: number;"
            );

        expect(productDto)
            .toContain(
                "name: string;"
            );

        expect(productDto)
            .toContain(
                "status?:"
            );

        expect(productDto)
            .toContain(
                "category?:"
            );

        expect(productDto)
            .toContain(
                "metadata?:"
            );

        expect(productDto)
            .toContain(
                "tags?: string[];"
            );

        expect(productDto)
            .toContain(
                "description?:"
            );

        // =========================
        // CreateProductRequest
        // =========================

        const createProductRequest =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "create-product-request.ts"
                ),
                "utf8"
            );

        expect(createProductRequest)
            .toContain(
                "name: string;"
            );

        expect(createProductRequest)
            .toContain(
                "price?: number;"
            );

        // =========================
        // Client
        // =========================

        const productsClient =
            await readFile(
                path.join(
                    outputDirectory,
                    "clients",
                    "products.client.ts"
                ),
                "utf8"
            );

        expect(productsClient)
            .toContain(
                "export class ProductsClient"
            );

        expect(productsClient)
            .toContain(
                "getProduct"
            );

        expect(productsClient)
            .toContain(
                "createProduct"
            );

        expect(productsClient)
            .toContain(
                "deleteProduct"
            );

        expect(productsClient)
            .toContain(
                "Promise<ProductDto>"
            );

        expect(productsClient)
            .toContain(
                "Promise<void>"
            );

    });
});
